/**
 * Copyright 2021 Opstrace, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type PrometheusProps = {
  // The Opstrace cluster hostname (foo.opstrace.io) where metrics data should be sent
  clusterHost: String;
  // The Opstrace tenant where metrics data should be sent
  tenantName: String;
  // The unique id that sent metrics should have as a label
  integrationId: String;
  // Where the user would like Prometheus to be deployed in their cluster
  deployNamespace: String;
};

enum PromtailLogFormat {
  // JSON-style logs used by dockerd
  // Example: {"log":"linux/amd64, go1.13.15, f59c03d0\n","stream":"stdout","time":"2021-05-07T04:46:42.866604098Z"}
  Docker = "docker",
  // TSV-style logs used by containerd/CRI
  // Example: 2021-05-03T18:30:48.888677423+12:00 stdout F 2021-05-03 06:30:48.888 [INFO][9] startup/startup.go 112: Datastore is ready
  CRI = "cri",
}

type PromtailProps = {
  // The Opstrace cluster hostname (foo.opstrace.io) where logs should be sent
  clusterHost: String;
  // The Opstrace tenant where logs should be sent
  tenantName: String;
  // The unique id that sent logs should have as a label
  integrationId: String;
  // Where the user would like Promtail to be deployed in their cluster
  deployNamespace: String;
  // Whether the user is running dockerd (docker) or containerd (cri) in their cluster
  logFormat: PromtailLogFormat;
};

// Returns a rendered prometheus deployment YAML for displaying to a user.
// After replacing __AUTH_TOKEN__ with the tenant auth token, the user can pass this to 'kubectl apply -f'.
export function prometheusYaml({
  clusterHost,
  tenantName,
  integrationId,
  deployNamespace
}: PrometheusProps): string {
  return `apiVersion: v1
kind: Namespace
apiVersion: v1
metadata:
  name: ${deployNamespace}
---
apiVersion: v1
kind: Secret
metadata:
  name: opstrace-tenant-auth
  namespace: ${deployNamespace}
stringData:
  token: '__AUTH_TOKEN__'
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: opstrace-prometheus
  namespace: ${deployNamespace}
data:
  prometheus.yml: |-
    remote_write:
    - url: https://cortex.${tenantName}.${clusterHost}/api/v1/push
      authorization:
        credentials_file: /var/run/tenant-auth/token

    scrape_configs:
    # Collection of per-pod metrics
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod

      # TLS config for getting pod info, not querying pods themselves
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      authorization:
        credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      relabel_configs:
      # Assign job tag with <namespace>/<pod name>
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_pod_name]
        action: replace
        separator: /
        replacement: $1
        target_label: job
      # Assign instance to <pod name>
      - source_labels: [__meta_kubernetes_pod_name]
        action: replace
        target_label: instance
      # Assign controller to <replicaset/statefulset/daemonset name>
      - source_labels: [__meta_kubernetes_pod_controller_name]
        action: replace
        target_label: controller
      # Assign container to <container name>
      - action: replace
        source_labels: [__meta_kubernetes_pod_container_name]
        target_label: container
      # Include node name
      - source_labels: [__meta_kubernetes_pod_node_name]
        target_label: node

      # Include integration ID for autodetection in opstrace
      - source_labels: []
        target_label: integration_id
        replacement: ${integrationId}

      # Internal labels used by prometheus itself
      # Always use HTTPS for scraping the api server
      - source_labels: [__meta_kubernetes_service_label_component]
        regex: apiserver
        action: replace
        target_label: __scheme__
        replacement: https

    # Collection of per-node metrics
    - job_name: 'kubernetes-nodes'
      kubernetes_sd_configs:
      - role: node

      scheme: https
      # TLS config for getting list of nodes to scrape, not querying nodes themselves
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      authorization:
        credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      relabel_configs:
      - target_label: __scheme__
        replacement: https
      # Include node hostname
      - source_labels: [__meta_kubernetes_node_label_kubernetes_io_hostname]
        target_label: instance
      # Include job label for the nodes
      - source_labels: []
        target_label: job
        replacement: kubelet
      # Include integration ID for autodetection in opstrace
      - source_labels: []
        target_label: integration_id
        replacement: ${integrationId}

    # Collection of the kubernetes apiserver
    - job_name: 'kubernetes-service'
      kubernetes_sd_configs:
      - role: endpoints

      # TLS config for getting endpoint info, not querying nodes themselves
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      authorization:
        credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      relabel_configs:
      - source_labels: [__meta_kubernetes_service_label_component]
        regex: apiserver
        action: keep
      - target_label: __scheme__
        replacement: https
      # Include job label for the service
      - source_labels: []
        target_label: job
        replacement: apiserver
      # Include integration ID for autodetection in opstrace
      - source_labels: []
        target_label: integration_id
        replacement: ${integrationId}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: opstrace-prometheus
  namespace: ${deployNamespace}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: opstrace-prometheus
rules:
- apiGroups:
  - ""
  resources:
  - nodes
  - nodes/metrics
  - nodes/proxy
  - services
  - endpoints
  - pods
  verbs:
  - get
  - list
  - watch
- nonResourceURLs:
  - /metrics
  verbs:
  - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: opstrace-prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: opstrace-prometheus
subjects:
- kind: ServiceAccount
  name: opstrace-prometheus
  namespace: ${deployNamespace}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opstrace-prometheus
  namespace: ${deployNamespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      name: opstrace-prometheus
  template:
    metadata:
      labels:
        name: opstrace-prometheus
    spec:
      serviceAccountName: opstrace-prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.26.0
        imagePullPolicy: IfNotPresent
        args:
        - --config.file=/etc/prometheus/prometheus.yml
        ports:
        - name: ui
          containerPort: 9090
        volumeMounts:
        # Prometheus configmap
        - name: config
          mountPath: /etc/prometheus
        # Opstrace tenant auth secret
        - name: tenant-auth
          mountPath: /var/run/tenant-auth
          readOnly: true
      volumes:
        - name: config
          configMap:
            name: opstrace-prometheus
        - name: tenant-auth
          secret:
            secretName: opstrace-tenant-auth
`;
}

// Returns a rendered promtail deployment YAML for displaying to a user.
// After replacing __AUTH_TOKEN__ with the tenant auth token, the user can pass this to 'kubectl apply -f'.
export function promtailYaml({
  clusterHost,
  tenantName,
  integrationId,
  deployNamespace,
  logFormat
}: PromtailProps): string {
  var dockerVolumeMount = "";
  var dockerVolume = "";
  if (logFormat === PromtailLogFormat.Docker) {
    dockerVolumeMount = `
        # Read-only access to /var/lib/docker/containers/, symlinked from /var/log/pods/
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true`;
    dockerVolume = `
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers`;
  }
  return `apiVersion: v1
kind: Namespace
apiVersion: v1
metadata:
  name: ${deployNamespace}
---
apiVersion: v1
kind: Secret
metadata:
  name: opstrace-tenant-auth
  namespace: ${deployNamespace}
stringData:
  token: '__AUTH_TOKEN__'
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: opstrace-promtail
  namespace: ${deployNamespace}
data:
  promtail.yml: |
    clients:
    - url: https://loki.${tenantName}.${clusterHost}/loki/api/v1/push
      bearer_token_file: /var/run/tenant-auth/token

    positions:
      # Must be writable by promtail, and should persist across restarts
      filename: /positions/positions.yaml

    scrape_configs:
    # Collection of per-pod logs
    - job_name: kubernetes-pods
      kubernetes_sd_configs:
      - role: pod

      # Whether the data is cri (tsv) or dockerd (json) format
      pipeline_stages:
      - ${logFormat}:

      relabel_configs:
      # Assign job tag with <namespace>/<pod name>
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_pod_name]
        action: replace
        separator: /
        replacement: $1
        target_label: job
      # Assign instance to <pod name>
      - action: replace
        source_labels: [__meta_kubernetes_pod_name]
        target_label: instance
      # Assign controller to <replicaset/statefulset/daemonset name>
      - source_labels: [__meta_kubernetes_pod_controller_name]
        action: replace
        target_label: controller
      # Assign container to <container name>
      - action: replace
        source_labels: [__meta_kubernetes_pod_container_name]
        target_label: container
      # Include node name
      - source_labels: [__meta_kubernetes_pod_node_name]
        target_label: node

      # Include integration ID for autodetection in opstrace
      - source_labels: []
        target_label: integration_id
        replacement: ${integrationId}

      # Internal labels used by promtail itself
      # Map node hostname to __host__, used by promtail to decide which instance should scrape the pod
      - source_labels: [__meta_kubernetes_pod_node_name]
        target_label: __host__
      # Map container to expected path: /var/log/pods/<namespace>_<podname>_<uuid>/<containername>/*.log
      - replacement: /var/log/pods/*$1/*.log
        separator: /
        source_labels: [__meta_kubernetes_pod_uid, __meta_kubernetes_pod_container_name]
        target_label: __path__
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: opstrace-promtail
  namespace: ${deployNamespace}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: opstrace-promtail
rules:
- apiGroups:
  - ""
  resources:
  - pods
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: opstrace-promtail
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: opstrace-promtail
subjects:
- kind: ServiceAccount
  name: opstrace-promtail
  namespace: ${deployNamespace}
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: opstrace-promtail
  namespace: ${deployNamespace}
spec:
  minReadySeconds: 10
  updateStrategy:
    type: RollingUpdate
  selector:
    matchLabels:
      name: opstrace-promtail
  template:
    metadata:
      labels:
        name: opstrace-promtail
    spec:
      serviceAccount: opstrace-promtail
      tolerations:
      - effect: NoSchedule
        operator: Exists
      containers:
      - name: promtail
        image: grafana/promtail:2.2.1
        imagePullPolicy: IfNotPresent
        args:
        - -config.file=/etc/promtail/promtail.yml
        env:
        # Used by promtail to detect which pods are on the same node
        - name: HOSTNAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        ports:
        - name: ui
          containerPort: 80
        readinessProbe:
          httpGet:
            path: /ready
            port: ui
            scheme: HTTP
          initialDelaySeconds: 10
        securityContext:
          # Pod logs are only accessible to uid=root
          runAsUser: 0
        volumeMounts:${dockerVolumeMount}
        # Promtail configmap
        - name: config
          mountPath: /etc/promtail
        # Opstrace tenant auth secret
        - name: tenant-auth
          mountPath: /var/run/tenant-auth
          readOnly: true
        # Read-only access to /var/log/pods/*
        - name: varlogpods
          mountPath: /var/log/pods
          readOnly: true
        # Read-write access to /var/log/opstrace-promtail for positions file
        - name: varlogopstracepromtail
          mountPath: /positions
          readOnly: false
      volumes:${dockerVolume}
      - name: config
        configMap:
          name: opstrace-promtail
      - name: tenant-auth
        secret:
          secretName: opstrace-tenant-auth
      - name: varlogpods
        hostPath:
          path: /var/log/pods
      - name: varlogopstracepromtail
        hostPath:
          path: /var/log/opstrace-promtail
`;
}
