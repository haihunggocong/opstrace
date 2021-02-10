/**
 * Copyright 2019-2021 Opstrace, Inc.
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

/**
 * taken from https://github.com/jetstack/cert-manager/releases/download/v1.0.3/cert-manager.yaml
 *
 * 1. copy the correct yaml
 * 2. covert to json (https://www.convertjson.com/yaml-to-json.htm)
 * 3. paste here
 * 4. `yarn generate-apis` (this will take this CRD and turn it into a KubernetesResource Class that we use in our Typescript).
 *     Output from this command is in https://github.com/opstrace/opstrace/tree/6be8da8aa2db3479d72acb47b0156ff2b04939a2/lib/kubernetes/src/custom-resources directory.
 * 5. it's likely you'll have compiler errors now in packages like the controller, where we now need to update the resource spec
 * 5. adjust any specs that now use the updated resources so they conform to the new spec.
 */

export const challenges = {
  apiVersion: "apiextensions.k8s.io/v1",
  kind: "CustomResourceDefinition",
  metadata: {
    annotations: {
      "cert-manager.io/inject-ca-from-secret":
        "cert-manager/cert-manager-webhook-ca"
    },
    labels: {
      app: "cert-manager",
      "app.kubernetes.io/instance": "cert-manager",
      "app.kubernetes.io/name": "cert-manager"
    },
    name: "challenges.acme.cert-manager.io"
  },
  spec: {
    conversion: {
      strategy: "Webhook",
      webhook: {
        clientConfig: {
          service: {
            name: "cert-manager-webhook",
            namespace: "cert-manager",
            path: "/convert"
          }
        },
        conversionReviewVersions: ["v1", "v1beta1"]
      }
    },
    group: "acme.cert-manager.io",
    names: {
      kind: "Challenge",
      listKind: "ChallengeList",
      plural: "challenges",
      singular: "challenge"
    },
    scope: "Namespaced",
    versions: [
      {
        additionalPrinterColumns: [
          {
            jsonPath: ".status.state",
            name: "State",
            type: "string"
          },
          {
            jsonPath: ".spec.dnsName",
            name: "Domain",
            type: "string"
          },
          {
            jsonPath: ".status.reason",
            name: "Reason",
            priority: 1,
            type: "string"
          },
          {
            description:
              "CreationTimestamp is a timestamp representing the server time when this object was created. It is not guaranteed to be set in happens-before order across separate operations. Clients may not set this value. It is represented in RFC3339 form and is in UTC.",
            jsonPath: ".metadata.creationTimestamp",
            name: "Age",
            type: "date"
          }
        ],
        name: "v1alpha2",
        schema: {
          openAPIV3Schema: {
            description:
              "Challenge is a type to represent a Challenge request with an ACME server",
            properties: {
              apiVersion: {
                description:
                  "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
                type: "string"
              },
              kind: {
                description:
                  "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
                type: "string"
              },
              metadata: {
                type: "object"
              },
              spec: {
                properties: {
                  authzURL: {
                    description:
                      "AuthzURL is the URL to the ACME Authorization resource that this challenge is a part of.",
                    type: "string"
                  },
                  dnsName: {
                    description:
                      "DNSName is the identifier that this challenge is for, e.g. example.com. If the requested DNSName is a 'wildcard', this field MUST be set to the non-wildcard domain, e.g. for `*.example.com`, it must be `example.com`.",
                    type: "string"
                  },
                  issuerRef: {
                    description:
                      "IssuerRef references a properly configured ACME-type Issuer which should be used to create this Challenge. If the Issuer does not exist, processing will be retried. If the Issuer is not an 'ACME' Issuer, an error will be returned and the Challenge will be marked as failed.",
                    properties: {
                      group: {
                        description: "Group of the resource being referred to.",
                        type: "string"
                      },
                      kind: {
                        description: "Kind of the resource being referred to.",
                        type: "string"
                      },
                      name: {
                        description: "Name of the resource being referred to.",
                        type: "string"
                      }
                    },
                    required: ["name"],
                    type: "object"
                  },
                  key: {
                    description:
                      "Key is the ACME challenge key for this challenge For HTTP01 challenges, this is the value that must be responded with to complete the HTTP01 challenge in the format: `<private key JWK thumbprint>.<key from acme server for challenge>`. For DNS01 challenges, this is the base64 encoded SHA256 sum of the `<private key JWK thumbprint>.<key from acme server for challenge>` text that must be set as the TXT record content.",
                    type: "string"
                  },
                  solver: {
                    description:
                      "Solver contains the domain solving configuration that should be used to solve this challenge resource.",
                    properties: {
                      dns01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the DNS01 challenge flow.",
                        properties: {
                          acmedns: {
                            description:
                              "Use the 'ACME DNS' (https://github.com/joohoi/acme-dns) API to manage DNS01 challenge records.",
                            properties: {
                              accountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              host: {
                                type: "string"
                              }
                            },
                            required: ["accountSecretRef", "host"],
                            type: "object"
                          },
                          akamai: {
                            description:
                              "Use the Akamai DNS zone management API to manage DNS01 challenge records.",
                            properties: {
                              accessTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              serviceConsumerDomain: {
                                type: "string"
                              }
                            },
                            required: [
                              "accessTokenSecretRef",
                              "clientSecretSecretRef",
                              "clientTokenSecretRef",
                              "serviceConsumerDomain"
                            ],
                            type: "object"
                          },
                          azuredns: {
                            description:
                              "Use the Microsoft Azure DNS API to manage DNS01 challenge records.",
                            properties: {
                              clientID: {
                                description:
                                  "if both this and ClientSecret are left unset MSI will be used",
                                type: "string"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "if both this and ClientID are left unset MSI will be used",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              environment: {
                                enum: [
                                  "AzurePublicCloud",
                                  "AzureChinaCloud",
                                  "AzureGermanCloud",
                                  "AzureUSGovernmentCloud"
                                ],
                                type: "string"
                              },
                              hostedZoneName: {
                                type: "string"
                              },
                              resourceGroupName: {
                                type: "string"
                              },
                              subscriptionID: {
                                type: "string"
                              },
                              tenantID: {
                                description:
                                  "when specifying ClientID and ClientSecret then this field is also needed",
                                type: "string"
                              }
                            },
                            required: ["resourceGroupName", "subscriptionID"],
                            type: "object"
                          },
                          cloudDNS: {
                            description:
                              "Use the Google Cloud DNS API to manage DNS01 challenge records.",
                            properties: {
                              hostedZoneName: {
                                description:
                                  "HostedZoneName is an optional field that tells cert-manager in which Cloud DNS zone the challenge record has to be created. If left empty cert-manager will automatically choose a zone.",
                                type: "string"
                              },
                              project: {
                                type: "string"
                              },
                              serviceAccountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["project"],
                            type: "object"
                          },
                          cloudflare: {
                            description:
                              "Use the Cloudflare API to manage DNS01 challenge records.",
                            properties: {
                              apiKeySecretRef: {
                                description:
                                  "API key to use to authenticate with Cloudflare. Note: using an API token to authenticate is now the recommended method as it allows greater control of permissions.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              apiTokenSecretRef: {
                                description:
                                  "API token used to authenticate with Cloudflare.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              email: {
                                description:
                                  "Email of the account, only required when using API key based authentication.",
                                type: "string"
                              }
                            },
                            type: "object"
                          },
                          cnameStrategy: {
                            description:
                              "CNAMEStrategy configures how the DNS01 provider should handle CNAME records when found in DNS zones.",
                            enum: ["None", "Follow"],
                            type: "string"
                          },
                          digitalocean: {
                            description:
                              "Use the DigitalOcean DNS API to manage DNS01 challenge records.",
                            properties: {
                              tokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["tokenSecretRef"],
                            type: "object"
                          },
                          rfc2136: {
                            description:
                              'Use RFC2136 ("Dynamic Updates in the Domain Name System") (https://datatracker.ietf.org/doc/rfc2136/) to manage DNS01 challenge records.',
                            properties: {
                              nameserver: {
                                description:
                                  "The IP address or hostname of an authoritative DNS server supporting RFC2136 in the form host:port. If the host is an IPv6 address it must be enclosed in square brackets (e.g [2001:db8::1]) ; port is optional. This field is required.",
                                type: "string"
                              },
                              tsigAlgorithm: {
                                description:
                                  "The TSIG Algorithm configured in the DNS supporting RFC2136. Used only when ``tsigSecretSecretRef`` and ``tsigKeyName`` are defined. Supported values are (case-insensitive): ``HMACMD5`` (default), ``HMACSHA1``, ``HMACSHA256`` or ``HMACSHA512``.",
                                type: "string"
                              },
                              tsigKeyName: {
                                description:
                                  "The TSIG Key name configured in the DNS. If ``tsigSecretSecretRef`` is defined, this field is required.",
                                type: "string"
                              },
                              tsigSecretSecretRef: {
                                description:
                                  "The name of the secret containing the TSIG value. If ``tsigKeyName`` is defined, this field is required.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["nameserver"],
                            type: "object"
                          },
                          route53: {
                            description:
                              "Use the AWS Route53 API to manage DNS01 challenge records.",
                            properties: {
                              accessKeyID: {
                                description:
                                  "The AccessKeyID is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata see: https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                type: "string"
                              },
                              hostedZoneID: {
                                description:
                                  "If set, the provider will manage only this zone in Route53 and will not do an lookup using the route53:ListHostedZonesByName api call.",
                                type: "string"
                              },
                              region: {
                                description:
                                  "Always set the region when using AccessKeyID and SecretAccessKey",
                                type: "string"
                              },
                              role: {
                                description:
                                  "Role is a Role ARN which the Route53 provider will assume using either the explicit credentials AccessKeyID/SecretAccessKey or the inferred credentials from environment variables, shared credentials file or AWS Instance metadata",
                                type: "string"
                              },
                              secretAccessKeySecretRef: {
                                description:
                                  "The SecretAccessKey is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["region"],
                            type: "object"
                          },
                          webhook: {
                            description:
                              "Configure an external webhook based DNS01 challenge solver to manage DNS01 challenge records.",
                            properties: {
                              config: {
                                description:
                                  "Additional configuration that should be passed to the webhook apiserver when challenges are processed. This can contain arbitrary JSON data. Secret values should not be specified in this stanza. If secret values are needed (e.g. credentials for a DNS service), you should use a SecretKeySelector to reference a Secret resource. For details on the schema of this field, consult the webhook provider implementation's documentation.",
                                "x-kubernetes-preserve-unknown-fields": true
                              },
                              groupName: {
                                description:
                                  "The API group name that should be used when POSTing ChallengePayload resources to the webhook apiserver. This should be the same as the GroupName specified in the webhook provider implementation.",
                                type: "string"
                              },
                              solverName: {
                                description:
                                  "The name of the solver to use, as defined in the webhook provider implementation. This will typically be the name of the provider, e.g. 'cloudflare'.",
                                type: "string"
                              }
                            },
                            required: ["groupName", "solverName"],
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      http01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the HTTP01 challenge flow. It is not possible to obtain certificates for wildcard domain names (e.g. `*.example.com`) using the HTTP01 challenge mechanism.",
                        properties: {
                          ingress: {
                            description:
                              "The ingress based HTTP01 challenge solver will solve challenges by creating or modifying Ingress resources in order to route requests for '/.well-known/acme-challenge/XYZ' to 'challenge solver' pods that are provisioned by cert-manager for each Challenge to be completed.",
                            properties: {
                              class: {
                                description:
                                  "The ingress class to use when creating Ingress resources to solve ACME challenges that use this challenge solver. Only one of 'class' or 'name' may be specified.",
                                type: "string"
                              },
                              ingressTemplate: {
                                description:
                                  "Optional ingress template used to configure the ACME challenge solver ingress used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the ingress used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              name: {
                                description:
                                  "The name of the ingress resource that should have ACME challenge solving routes inserted into it in order to solve HTTP01 challenges. This is typically used in conjunction with ingress controllers like ingress-gce, which maintains a 1:1 mapping between external IPs and ingress resources.",
                                type: "string"
                              },
                              podTemplate: {
                                description:
                                  "Optional pod template used to configure the ACME challenge solver pods used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the pod used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the create ACME HTTP01 solver pods.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver pods.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  },
                                  spec: {
                                    description:
                                      "PodSpec defines overrides for the HTTP01 challenge solver pod. Only the 'priorityClassName', 'nodeSelector', 'affinity', 'serviceAccountName' and 'tolerations' fields are supported currently. All other fields will be ignored.",
                                    properties: {
                                      affinity: {
                                        description:
                                          "If specified, the pod's scheduling constraints",
                                        properties: {
                                          nodeAffinity: {
                                            description:
                                              "Describes node affinity scheduling rules for the pod.",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "An empty preferred scheduling term matches all objects with implicit weight 0 (i.e. it's a no-op). A null preferred scheduling term matches no objects (i.e. is also a no-op).",
                                                  properties: {
                                                    preference: {
                                                      description:
                                                        "A node selector term, associated with the corresponding weight.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "preference",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to an update), the system may or may not try to eventually evict the pod from its node.",
                                                properties: {
                                                  nodeSelectorTerms: {
                                                    description:
                                                      "Required. A list of node selector terms. The terms are ORed.",
                                                    items: {
                                                      description:
                                                        "A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    type: "array"
                                                  }
                                                },
                                                required: ["nodeSelectorTerms"],
                                                type: "object"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAffinity: {
                                            description:
                                              "Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAntiAffinity: {
                                            description:
                                              "Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          }
                                        },
                                        type: "object"
                                      },
                                      nodeSelector: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/",
                                        type: "object"
                                      },
                                      priorityClassName: {
                                        description:
                                          "If specified, the pod's priorityClassName.",
                                        type: "string"
                                      },
                                      serviceAccountName: {
                                        description:
                                          "If specified, the pod's service account",
                                        type: "string"
                                      },
                                      tolerations: {
                                        description:
                                          "If specified, the pod's tolerations.",
                                        items: {
                                          description:
                                            "The pod this Toleration is attached to tolerates any taint that matches the triple <key,value,effect> using the matching operator <operator>.",
                                          properties: {
                                            effect: {
                                              description:
                                                "Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.",
                                              type: "string"
                                            },
                                            key: {
                                              description:
                                                "Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.",
                                              type: "string"
                                            },
                                            operator: {
                                              description:
                                                "Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.",
                                              type: "string"
                                            },
                                            tolerationSeconds: {
                                              description:
                                                "TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.",
                                              format: "int64",
                                              type: "integer"
                                            },
                                            value: {
                                              description:
                                                "Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.",
                                              type: "string"
                                            }
                                          },
                                          type: "object"
                                        },
                                        type: "array"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              serviceType: {
                                description:
                                  "Optional service type for Kubernetes solver service",
                                type: "string"
                              }
                            },
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      selector: {
                        description:
                          "Selector selects a set of DNSNames on the Certificate resource that should be solved using this challenge solver. If not specified, the solver will be treated as the 'default' solver with the lowest priority, i.e. if any other solver has a more specific match, it will be used instead.",
                        properties: {
                          dnsNames: {
                            description:
                              "List of DNSNames that this solver will be used to solve. If specified and a match is found, a dnsNames selector will take precedence over a dnsZones selector. If multiple solvers match with the same dnsNames value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          dnsZones: {
                            description:
                              "List of DNSZones that this solver will be used to solve. The most specific DNS zone match specified here will take precedence over other DNS zone matches, so a solver specifying sys.example.com will be selected over one specifying example.com for the domain www.sys.example.com. If multiple solvers match with the same dnsZones value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          matchLabels: {
                            additionalProperties: {
                              type: "string"
                            },
                            description:
                              "A label selector that is used to refine the set of certificate's that this challenge solver will apply to.",
                            type: "object"
                          }
                        },
                        type: "object"
                      }
                    },
                    type: "object"
                  },
                  token: {
                    description:
                      "Token is the ACME challenge token for this challenge. This is the raw value returned from the ACME server.",
                    type: "string"
                  },
                  type: {
                    description:
                      'Type is the type of ACME challenge this resource represents. One of "http-01" or "dns-01".',
                    enum: ["http-01", "dns-01"],
                    type: "string"
                  },
                  url: {
                    description:
                      "URL is the URL of the ACME Challenge resource for this challenge. This can be used to lookup details about the status of this challenge.",
                    type: "string"
                  },
                  wildcard: {
                    description:
                      "Wildcard will be true if this challenge is for a wildcard identifier, for example '*.example.com'.",
                    type: "boolean"
                  }
                },
                required: [
                  "authzURL",
                  "dnsName",
                  "issuerRef",
                  "key",
                  "solver",
                  "token",
                  "type",
                  "url"
                ],
                type: "object"
              },
              status: {
                properties: {
                  presented: {
                    description:
                      "Presented will be set to true if the challenge values for this challenge are currently 'presented'. This *does not* imply the self check is passing. Only that the values have been 'submitted' for the appropriate challenge mechanism (i.e. the DNS01 TXT record has been presented, or the HTTP01 configuration has been configured).",
                    type: "boolean"
                  },
                  processing: {
                    description:
                      "Processing is used to denote whether this challenge should be processed or not. This field will only be set to true by the 'scheduling' component. It will only be set to false by the 'challenges' controller, after the challenge has reached a final state or timed out. If this field is set to false, the challenge controller will not take any more action.",
                    type: "boolean"
                  },
                  reason: {
                    description:
                      "Reason contains human readable information on why the Challenge is in the current state.",
                    type: "string"
                  },
                  state: {
                    description:
                      "State contains the current 'state' of the challenge. If not set, the state of the challenge is unknown.",
                    enum: [
                      "valid",
                      "ready",
                      "pending",
                      "processing",
                      "invalid",
                      "expired",
                      "errored"
                    ],
                    type: "string"
                  }
                },
                type: "object"
              }
            },
            required: ["metadata"],
            type: "object"
          }
        },
        served: true,
        storage: false,
        subresources: {
          status: {}
        }
      },
      {
        additionalPrinterColumns: [
          {
            jsonPath: ".status.state",
            name: "State",
            type: "string"
          },
          {
            jsonPath: ".spec.dnsName",
            name: "Domain",
            type: "string"
          },
          {
            jsonPath: ".status.reason",
            name: "Reason",
            priority: 1,
            type: "string"
          },
          {
            description:
              "CreationTimestamp is a timestamp representing the server time when this object was created. It is not guaranteed to be set in happens-before order across separate operations. Clients may not set this value. It is represented in RFC3339 form and is in UTC.",
            jsonPath: ".metadata.creationTimestamp",
            name: "Age",
            type: "date"
          }
        ],
        name: "v1alpha3",
        schema: {
          openAPIV3Schema: {
            description:
              "Challenge is a type to represent a Challenge request with an ACME server",
            properties: {
              apiVersion: {
                description:
                  "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
                type: "string"
              },
              kind: {
                description:
                  "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
                type: "string"
              },
              metadata: {
                type: "object"
              },
              spec: {
                properties: {
                  authzURL: {
                    description:
                      "AuthzURL is the URL to the ACME Authorization resource that this challenge is a part of.",
                    type: "string"
                  },
                  dnsName: {
                    description:
                      "DNSName is the identifier that this challenge is for, e.g. example.com. If the requested DNSName is a 'wildcard', this field MUST be set to the non-wildcard domain, e.g. for `*.example.com`, it must be `example.com`.",
                    type: "string"
                  },
                  issuerRef: {
                    description:
                      "IssuerRef references a properly configured ACME-type Issuer which should be used to create this Challenge. If the Issuer does not exist, processing will be retried. If the Issuer is not an 'ACME' Issuer, an error will be returned and the Challenge will be marked as failed.",
                    properties: {
                      group: {
                        description: "Group of the resource being referred to.",
                        type: "string"
                      },
                      kind: {
                        description: "Kind of the resource being referred to.",
                        type: "string"
                      },
                      name: {
                        description: "Name of the resource being referred to.",
                        type: "string"
                      }
                    },
                    required: ["name"],
                    type: "object"
                  },
                  key: {
                    description:
                      "Key is the ACME challenge key for this challenge For HTTP01 challenges, this is the value that must be responded with to complete the HTTP01 challenge in the format: `<private key JWK thumbprint>.<key from acme server for challenge>`. For DNS01 challenges, this is the base64 encoded SHA256 sum of the `<private key JWK thumbprint>.<key from acme server for challenge>` text that must be set as the TXT record content.",
                    type: "string"
                  },
                  solver: {
                    description:
                      "Solver contains the domain solving configuration that should be used to solve this challenge resource.",
                    properties: {
                      dns01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the DNS01 challenge flow.",
                        properties: {
                          acmedns: {
                            description:
                              "Use the 'ACME DNS' (https://github.com/joohoi/acme-dns) API to manage DNS01 challenge records.",
                            properties: {
                              accountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              host: {
                                type: "string"
                              }
                            },
                            required: ["accountSecretRef", "host"],
                            type: "object"
                          },
                          akamai: {
                            description:
                              "Use the Akamai DNS zone management API to manage DNS01 challenge records.",
                            properties: {
                              accessTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              serviceConsumerDomain: {
                                type: "string"
                              }
                            },
                            required: [
                              "accessTokenSecretRef",
                              "clientSecretSecretRef",
                              "clientTokenSecretRef",
                              "serviceConsumerDomain"
                            ],
                            type: "object"
                          },
                          azuredns: {
                            description:
                              "Use the Microsoft Azure DNS API to manage DNS01 challenge records.",
                            properties: {
                              clientID: {
                                description:
                                  "if both this and ClientSecret are left unset MSI will be used",
                                type: "string"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "if both this and ClientID are left unset MSI will be used",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              environment: {
                                enum: [
                                  "AzurePublicCloud",
                                  "AzureChinaCloud",
                                  "AzureGermanCloud",
                                  "AzureUSGovernmentCloud"
                                ],
                                type: "string"
                              },
                              hostedZoneName: {
                                type: "string"
                              },
                              resourceGroupName: {
                                type: "string"
                              },
                              subscriptionID: {
                                type: "string"
                              },
                              tenantID: {
                                description:
                                  "when specifying ClientID and ClientSecret then this field is also needed",
                                type: "string"
                              }
                            },
                            required: ["resourceGroupName", "subscriptionID"],
                            type: "object"
                          },
                          cloudDNS: {
                            description:
                              "Use the Google Cloud DNS API to manage DNS01 challenge records.",
                            properties: {
                              hostedZoneName: {
                                description:
                                  "HostedZoneName is an optional field that tells cert-manager in which Cloud DNS zone the challenge record has to be created. If left empty cert-manager will automatically choose a zone.",
                                type: "string"
                              },
                              project: {
                                type: "string"
                              },
                              serviceAccountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["project"],
                            type: "object"
                          },
                          cloudflare: {
                            description:
                              "Use the Cloudflare API to manage DNS01 challenge records.",
                            properties: {
                              apiKeySecretRef: {
                                description:
                                  "API key to use to authenticate with Cloudflare. Note: using an API token to authenticate is now the recommended method as it allows greater control of permissions.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              apiTokenSecretRef: {
                                description:
                                  "API token used to authenticate with Cloudflare.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              email: {
                                description:
                                  "Email of the account, only required when using API key based authentication.",
                                type: "string"
                              }
                            },
                            type: "object"
                          },
                          cnameStrategy: {
                            description:
                              "CNAMEStrategy configures how the DNS01 provider should handle CNAME records when found in DNS zones.",
                            enum: ["None", "Follow"],
                            type: "string"
                          },
                          digitalocean: {
                            description:
                              "Use the DigitalOcean DNS API to manage DNS01 challenge records.",
                            properties: {
                              tokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["tokenSecretRef"],
                            type: "object"
                          },
                          rfc2136: {
                            description:
                              'Use RFC2136 ("Dynamic Updates in the Domain Name System") (https://datatracker.ietf.org/doc/rfc2136/) to manage DNS01 challenge records.',
                            properties: {
                              nameserver: {
                                description:
                                  "The IP address or hostname of an authoritative DNS server supporting RFC2136 in the form host:port. If the host is an IPv6 address it must be enclosed in square brackets (e.g [2001:db8::1]) ; port is optional. This field is required.",
                                type: "string"
                              },
                              tsigAlgorithm: {
                                description:
                                  "The TSIG Algorithm configured in the DNS supporting RFC2136. Used only when ``tsigSecretSecretRef`` and ``tsigKeyName`` are defined. Supported values are (case-insensitive): ``HMACMD5`` (default), ``HMACSHA1``, ``HMACSHA256`` or ``HMACSHA512``.",
                                type: "string"
                              },
                              tsigKeyName: {
                                description:
                                  "The TSIG Key name configured in the DNS. If ``tsigSecretSecretRef`` is defined, this field is required.",
                                type: "string"
                              },
                              tsigSecretSecretRef: {
                                description:
                                  "The name of the secret containing the TSIG value. If ``tsigKeyName`` is defined, this field is required.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["nameserver"],
                            type: "object"
                          },
                          route53: {
                            description:
                              "Use the AWS Route53 API to manage DNS01 challenge records.",
                            properties: {
                              accessKeyID: {
                                description:
                                  "The AccessKeyID is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata see: https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                type: "string"
                              },
                              hostedZoneID: {
                                description:
                                  "If set, the provider will manage only this zone in Route53 and will not do an lookup using the route53:ListHostedZonesByName api call.",
                                type: "string"
                              },
                              region: {
                                description:
                                  "Always set the region when using AccessKeyID and SecretAccessKey",
                                type: "string"
                              },
                              role: {
                                description:
                                  "Role is a Role ARN which the Route53 provider will assume using either the explicit credentials AccessKeyID/SecretAccessKey or the inferred credentials from environment variables, shared credentials file or AWS Instance metadata",
                                type: "string"
                              },
                              secretAccessKeySecretRef: {
                                description:
                                  "The SecretAccessKey is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["region"],
                            type: "object"
                          },
                          webhook: {
                            description:
                              "Configure an external webhook based DNS01 challenge solver to manage DNS01 challenge records.",
                            properties: {
                              config: {
                                description:
                                  "Additional configuration that should be passed to the webhook apiserver when challenges are processed. This can contain arbitrary JSON data. Secret values should not be specified in this stanza. If secret values are needed (e.g. credentials for a DNS service), you should use a SecretKeySelector to reference a Secret resource. For details on the schema of this field, consult the webhook provider implementation's documentation.",
                                "x-kubernetes-preserve-unknown-fields": true
                              },
                              groupName: {
                                description:
                                  "The API group name that should be used when POSTing ChallengePayload resources to the webhook apiserver. This should be the same as the GroupName specified in the webhook provider implementation.",
                                type: "string"
                              },
                              solverName: {
                                description:
                                  "The name of the solver to use, as defined in the webhook provider implementation. This will typically be the name of the provider, e.g. 'cloudflare'.",
                                type: "string"
                              }
                            },
                            required: ["groupName", "solverName"],
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      http01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the HTTP01 challenge flow. It is not possible to obtain certificates for wildcard domain names (e.g. `*.example.com`) using the HTTP01 challenge mechanism.",
                        properties: {
                          ingress: {
                            description:
                              "The ingress based HTTP01 challenge solver will solve challenges by creating or modifying Ingress resources in order to route requests for '/.well-known/acme-challenge/XYZ' to 'challenge solver' pods that are provisioned by cert-manager for each Challenge to be completed.",
                            properties: {
                              class: {
                                description:
                                  "The ingress class to use when creating Ingress resources to solve ACME challenges that use this challenge solver. Only one of 'class' or 'name' may be specified.",
                                type: "string"
                              },
                              ingressTemplate: {
                                description:
                                  "Optional ingress template used to configure the ACME challenge solver ingress used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the ingress used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              name: {
                                description:
                                  "The name of the ingress resource that should have ACME challenge solving routes inserted into it in order to solve HTTP01 challenges. This is typically used in conjunction with ingress controllers like ingress-gce, which maintains a 1:1 mapping between external IPs and ingress resources.",
                                type: "string"
                              },
                              podTemplate: {
                                description:
                                  "Optional pod template used to configure the ACME challenge solver pods used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the pod used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the create ACME HTTP01 solver pods.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver pods.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  },
                                  spec: {
                                    description:
                                      "PodSpec defines overrides for the HTTP01 challenge solver pod. Only the 'priorityClassName', 'nodeSelector', 'affinity', 'serviceAccountName' and 'tolerations' fields are supported currently. All other fields will be ignored.",
                                    properties: {
                                      affinity: {
                                        description:
                                          "If specified, the pod's scheduling constraints",
                                        properties: {
                                          nodeAffinity: {
                                            description:
                                              "Describes node affinity scheduling rules for the pod.",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "An empty preferred scheduling term matches all objects with implicit weight 0 (i.e. it's a no-op). A null preferred scheduling term matches no objects (i.e. is also a no-op).",
                                                  properties: {
                                                    preference: {
                                                      description:
                                                        "A node selector term, associated with the corresponding weight.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "preference",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to an update), the system may or may not try to eventually evict the pod from its node.",
                                                properties: {
                                                  nodeSelectorTerms: {
                                                    description:
                                                      "Required. A list of node selector terms. The terms are ORed.",
                                                    items: {
                                                      description:
                                                        "A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    type: "array"
                                                  }
                                                },
                                                required: ["nodeSelectorTerms"],
                                                type: "object"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAffinity: {
                                            description:
                                              "Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAntiAffinity: {
                                            description:
                                              "Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          }
                                        },
                                        type: "object"
                                      },
                                      nodeSelector: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/",
                                        type: "object"
                                      },
                                      priorityClassName: {
                                        description:
                                          "If specified, the pod's priorityClassName.",
                                        type: "string"
                                      },
                                      serviceAccountName: {
                                        description:
                                          "If specified, the pod's service account",
                                        type: "string"
                                      },
                                      tolerations: {
                                        description:
                                          "If specified, the pod's tolerations.",
                                        items: {
                                          description:
                                            "The pod this Toleration is attached to tolerates any taint that matches the triple <key,value,effect> using the matching operator <operator>.",
                                          properties: {
                                            effect: {
                                              description:
                                                "Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.",
                                              type: "string"
                                            },
                                            key: {
                                              description:
                                                "Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.",
                                              type: "string"
                                            },
                                            operator: {
                                              description:
                                                "Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.",
                                              type: "string"
                                            },
                                            tolerationSeconds: {
                                              description:
                                                "TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.",
                                              format: "int64",
                                              type: "integer"
                                            },
                                            value: {
                                              description:
                                                "Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.",
                                              type: "string"
                                            }
                                          },
                                          type: "object"
                                        },
                                        type: "array"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              serviceType: {
                                description:
                                  "Optional service type for Kubernetes solver service",
                                type: "string"
                              }
                            },
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      selector: {
                        description:
                          "Selector selects a set of DNSNames on the Certificate resource that should be solved using this challenge solver. If not specified, the solver will be treated as the 'default' solver with the lowest priority, i.e. if any other solver has a more specific match, it will be used instead.",
                        properties: {
                          dnsNames: {
                            description:
                              "List of DNSNames that this solver will be used to solve. If specified and a match is found, a dnsNames selector will take precedence over a dnsZones selector. If multiple solvers match with the same dnsNames value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          dnsZones: {
                            description:
                              "List of DNSZones that this solver will be used to solve. The most specific DNS zone match specified here will take precedence over other DNS zone matches, so a solver specifying sys.example.com will be selected over one specifying example.com for the domain www.sys.example.com. If multiple solvers match with the same dnsZones value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          matchLabels: {
                            additionalProperties: {
                              type: "string"
                            },
                            description:
                              "A label selector that is used to refine the set of certificate's that this challenge solver will apply to.",
                            type: "object"
                          }
                        },
                        type: "object"
                      }
                    },
                    type: "object"
                  },
                  token: {
                    description:
                      "Token is the ACME challenge token for this challenge. This is the raw value returned from the ACME server.",
                    type: "string"
                  },
                  type: {
                    description:
                      'Type is the type of ACME challenge this resource represents. One of "http-01" or "dns-01".',
                    enum: ["http-01", "dns-01"],
                    type: "string"
                  },
                  url: {
                    description:
                      "URL is the URL of the ACME Challenge resource for this challenge. This can be used to lookup details about the status of this challenge.",
                    type: "string"
                  },
                  wildcard: {
                    description:
                      "Wildcard will be true if this challenge is for a wildcard identifier, for example '*.example.com'.",
                    type: "boolean"
                  }
                },
                required: [
                  "authzURL",
                  "dnsName",
                  "issuerRef",
                  "key",
                  "solver",
                  "token",
                  "type",
                  "url"
                ],
                type: "object"
              },
              status: {
                properties: {
                  presented: {
                    description:
                      "Presented will be set to true if the challenge values for this challenge are currently 'presented'. This *does not* imply the self check is passing. Only that the values have been 'submitted' for the appropriate challenge mechanism (i.e. the DNS01 TXT record has been presented, or the HTTP01 configuration has been configured).",
                    type: "boolean"
                  },
                  processing: {
                    description:
                      "Processing is used to denote whether this challenge should be processed or not. This field will only be set to true by the 'scheduling' component. It will only be set to false by the 'challenges' controller, after the challenge has reached a final state or timed out. If this field is set to false, the challenge controller will not take any more action.",
                    type: "boolean"
                  },
                  reason: {
                    description:
                      "Reason contains human readable information on why the Challenge is in the current state.",
                    type: "string"
                  },
                  state: {
                    description:
                      "State contains the current 'state' of the challenge. If not set, the state of the challenge is unknown.",
                    enum: [
                      "valid",
                      "ready",
                      "pending",
                      "processing",
                      "invalid",
                      "expired",
                      "errored"
                    ],
                    type: "string"
                  }
                },
                type: "object"
              }
            },
            required: ["metadata"],
            type: "object"
          }
        },
        served: true,
        storage: false,
        subresources: {
          status: {}
        }
      },
      {
        additionalPrinterColumns: [
          {
            jsonPath: ".status.state",
            name: "State",
            type: "string"
          },
          {
            jsonPath: ".spec.dnsName",
            name: "Domain",
            type: "string"
          },
          {
            jsonPath: ".status.reason",
            name: "Reason",
            priority: 1,
            type: "string"
          },
          {
            description:
              "CreationTimestamp is a timestamp representing the server time when this object was created. It is not guaranteed to be set in happens-before order across separate operations. Clients may not set this value. It is represented in RFC3339 form and is in UTC.",
            jsonPath: ".metadata.creationTimestamp",
            name: "Age",
            type: "date"
          }
        ],
        name: "v1beta1",
        schema: {
          openAPIV3Schema: {
            description:
              "Challenge is a type to represent a Challenge request with an ACME server",
            properties: {
              apiVersion: {
                description:
                  "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
                type: "string"
              },
              kind: {
                description:
                  "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
                type: "string"
              },
              metadata: {
                type: "object"
              },
              spec: {
                properties: {
                  authorizationURL: {
                    description:
                      "The URL to the ACME Authorization resource that this challenge is a part of.",
                    type: "string"
                  },
                  dnsName: {
                    description:
                      "dnsName is the identifier that this challenge is for, e.g. example.com. If the requested DNSName is a 'wildcard', this field MUST be set to the non-wildcard domain, e.g. for `*.example.com`, it must be `example.com`.",
                    type: "string"
                  },
                  issuerRef: {
                    description:
                      "References a properly configured ACME-type Issuer which should be used to create this Challenge. If the Issuer does not exist, processing will be retried. If the Issuer is not an 'ACME' Issuer, an error will be returned and the Challenge will be marked as failed.",
                    properties: {
                      group: {
                        description: "Group of the resource being referred to.",
                        type: "string"
                      },
                      kind: {
                        description: "Kind of the resource being referred to.",
                        type: "string"
                      },
                      name: {
                        description: "Name of the resource being referred to.",
                        type: "string"
                      }
                    },
                    required: ["name"],
                    type: "object"
                  },
                  key: {
                    description:
                      "The ACME challenge key for this challenge For HTTP01 challenges, this is the value that must be responded with to complete the HTTP01 challenge in the format: `<private key JWK thumbprint>.<key from acme server for challenge>`. For DNS01 challenges, this is the base64 encoded SHA256 sum of the `<private key JWK thumbprint>.<key from acme server for challenge>` text that must be set as the TXT record content.",
                    type: "string"
                  },
                  solver: {
                    description:
                      "Contains the domain solving configuration that should be used to solve this challenge resource.",
                    properties: {
                      dns01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the DNS01 challenge flow.",
                        properties: {
                          acmeDNS: {
                            description:
                              "Use the 'ACME DNS' (https://github.com/joohoi/acme-dns) API to manage DNS01 challenge records.",
                            properties: {
                              accountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              host: {
                                type: "string"
                              }
                            },
                            required: ["accountSecretRef", "host"],
                            type: "object"
                          },
                          akamai: {
                            description:
                              "Use the Akamai DNS zone management API to manage DNS01 challenge records.",
                            properties: {
                              accessTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              serviceConsumerDomain: {
                                type: "string"
                              }
                            },
                            required: [
                              "accessTokenSecretRef",
                              "clientSecretSecretRef",
                              "clientTokenSecretRef",
                              "serviceConsumerDomain"
                            ],
                            type: "object"
                          },
                          azureDNS: {
                            description:
                              "Use the Microsoft Azure DNS API to manage DNS01 challenge records.",
                            properties: {
                              clientID: {
                                description:
                                  "if both this and ClientSecret are left unset MSI will be used",
                                type: "string"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "if both this and ClientID are left unset MSI will be used",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              environment: {
                                enum: [
                                  "AzurePublicCloud",
                                  "AzureChinaCloud",
                                  "AzureGermanCloud",
                                  "AzureUSGovernmentCloud"
                                ],
                                type: "string"
                              },
                              hostedZoneName: {
                                type: "string"
                              },
                              resourceGroupName: {
                                type: "string"
                              },
                              subscriptionID: {
                                type: "string"
                              },
                              tenantID: {
                                description:
                                  "when specifying ClientID and ClientSecret then this field is also needed",
                                type: "string"
                              }
                            },
                            required: ["resourceGroupName", "subscriptionID"],
                            type: "object"
                          },
                          cloudDNS: {
                            description:
                              "Use the Google Cloud DNS API to manage DNS01 challenge records.",
                            properties: {
                              hostedZoneName: {
                                description:
                                  "HostedZoneName is an optional field that tells cert-manager in which Cloud DNS zone the challenge record has to be created. If left empty cert-manager will automatically choose a zone.",
                                type: "string"
                              },
                              project: {
                                type: "string"
                              },
                              serviceAccountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["project"],
                            type: "object"
                          },
                          cloudflare: {
                            description:
                              "Use the Cloudflare API to manage DNS01 challenge records.",
                            properties: {
                              apiKeySecretRef: {
                                description:
                                  "API key to use to authenticate with Cloudflare. Note: using an API token to authenticate is now the recommended method as it allows greater control of permissions.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              apiTokenSecretRef: {
                                description:
                                  "API token used to authenticate with Cloudflare.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              email: {
                                description:
                                  "Email of the account, only required when using API key based authentication.",
                                type: "string"
                              }
                            },
                            type: "object"
                          },
                          cnameStrategy: {
                            description:
                              "CNAMEStrategy configures how the DNS01 provider should handle CNAME records when found in DNS zones.",
                            enum: ["None", "Follow"],
                            type: "string"
                          },
                          digitalocean: {
                            description:
                              "Use the DigitalOcean DNS API to manage DNS01 challenge records.",
                            properties: {
                              tokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["tokenSecretRef"],
                            type: "object"
                          },
                          rfc2136: {
                            description:
                              'Use RFC2136 ("Dynamic Updates in the Domain Name System") (https://datatracker.ietf.org/doc/rfc2136/) to manage DNS01 challenge records.',
                            properties: {
                              nameserver: {
                                description:
                                  "The IP address or hostname of an authoritative DNS server supporting RFC2136 in the form host:port. If the host is an IPv6 address it must be enclosed in square brackets (e.g [2001:db8::1]) ; port is optional. This field is required.",
                                type: "string"
                              },
                              tsigAlgorithm: {
                                description:
                                  "The TSIG Algorithm configured in the DNS supporting RFC2136. Used only when ``tsigSecretSecretRef`` and ``tsigKeyName`` are defined. Supported values are (case-insensitive): ``HMACMD5`` (default), ``HMACSHA1``, ``HMACSHA256`` or ``HMACSHA512``.",
                                type: "string"
                              },
                              tsigKeyName: {
                                description:
                                  "The TSIG Key name configured in the DNS. If ``tsigSecretSecretRef`` is defined, this field is required.",
                                type: "string"
                              },
                              tsigSecretSecretRef: {
                                description:
                                  "The name of the secret containing the TSIG value. If ``tsigKeyName`` is defined, this field is required.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["nameserver"],
                            type: "object"
                          },
                          route53: {
                            description:
                              "Use the AWS Route53 API to manage DNS01 challenge records.",
                            properties: {
                              accessKeyID: {
                                description:
                                  "The AccessKeyID is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata see: https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                type: "string"
                              },
                              hostedZoneID: {
                                description:
                                  "If set, the provider will manage only this zone in Route53 and will not do an lookup using the route53:ListHostedZonesByName api call.",
                                type: "string"
                              },
                              region: {
                                description:
                                  "Always set the region when using AccessKeyID and SecretAccessKey",
                                type: "string"
                              },
                              role: {
                                description:
                                  "Role is a Role ARN which the Route53 provider will assume using either the explicit credentials AccessKeyID/SecretAccessKey or the inferred credentials from environment variables, shared credentials file or AWS Instance metadata",
                                type: "string"
                              },
                              secretAccessKeySecretRef: {
                                description:
                                  "The SecretAccessKey is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["region"],
                            type: "object"
                          },
                          webhook: {
                            description:
                              "Configure an external webhook based DNS01 challenge solver to manage DNS01 challenge records.",
                            properties: {
                              config: {
                                description:
                                  "Additional configuration that should be passed to the webhook apiserver when challenges are processed. This can contain arbitrary JSON data. Secret values should not be specified in this stanza. If secret values are needed (e.g. credentials for a DNS service), you should use a SecretKeySelector to reference a Secret resource. For details on the schema of this field, consult the webhook provider implementation's documentation.",
                                "x-kubernetes-preserve-unknown-fields": true
                              },
                              groupName: {
                                description:
                                  "The API group name that should be used when POSTing ChallengePayload resources to the webhook apiserver. This should be the same as the GroupName specified in the webhook provider implementation.",
                                type: "string"
                              },
                              solverName: {
                                description:
                                  "The name of the solver to use, as defined in the webhook provider implementation. This will typically be the name of the provider, e.g. 'cloudflare'.",
                                type: "string"
                              }
                            },
                            required: ["groupName", "solverName"],
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      http01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the HTTP01 challenge flow. It is not possible to obtain certificates for wildcard domain names (e.g. `*.example.com`) using the HTTP01 challenge mechanism.",
                        properties: {
                          ingress: {
                            description:
                              "The ingress based HTTP01 challenge solver will solve challenges by creating or modifying Ingress resources in order to route requests for '/.well-known/acme-challenge/XYZ' to 'challenge solver' pods that are provisioned by cert-manager for each Challenge to be completed.",
                            properties: {
                              class: {
                                description:
                                  "The ingress class to use when creating Ingress resources to solve ACME challenges that use this challenge solver. Only one of 'class' or 'name' may be specified.",
                                type: "string"
                              },
                              ingressTemplate: {
                                description:
                                  "Optional ingress template used to configure the ACME challenge solver ingress used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the ingress used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              name: {
                                description:
                                  "The name of the ingress resource that should have ACME challenge solving routes inserted into it in order to solve HTTP01 challenges. This is typically used in conjunction with ingress controllers like ingress-gce, which maintains a 1:1 mapping between external IPs and ingress resources.",
                                type: "string"
                              },
                              podTemplate: {
                                description:
                                  "Optional pod template used to configure the ACME challenge solver pods used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the pod used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the create ACME HTTP01 solver pods.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver pods.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  },
                                  spec: {
                                    description:
                                      "PodSpec defines overrides for the HTTP01 challenge solver pod. Only the 'priorityClassName', 'nodeSelector', 'affinity', 'serviceAccountName' and 'tolerations' fields are supported currently. All other fields will be ignored.",
                                    properties: {
                                      affinity: {
                                        description:
                                          "If specified, the pod's scheduling constraints",
                                        properties: {
                                          nodeAffinity: {
                                            description:
                                              "Describes node affinity scheduling rules for the pod.",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "An empty preferred scheduling term matches all objects with implicit weight 0 (i.e. it's a no-op). A null preferred scheduling term matches no objects (i.e. is also a no-op).",
                                                  properties: {
                                                    preference: {
                                                      description:
                                                        "A node selector term, associated with the corresponding weight.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "preference",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to an update), the system may or may not try to eventually evict the pod from its node.",
                                                properties: {
                                                  nodeSelectorTerms: {
                                                    description:
                                                      "Required. A list of node selector terms. The terms are ORed.",
                                                    items: {
                                                      description:
                                                        "A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    type: "array"
                                                  }
                                                },
                                                required: ["nodeSelectorTerms"],
                                                type: "object"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAffinity: {
                                            description:
                                              "Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAntiAffinity: {
                                            description:
                                              "Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          }
                                        },
                                        type: "object"
                                      },
                                      nodeSelector: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/",
                                        type: "object"
                                      },
                                      priorityClassName: {
                                        description:
                                          "If specified, the pod's priorityClassName.",
                                        type: "string"
                                      },
                                      serviceAccountName: {
                                        description:
                                          "If specified, the pod's service account",
                                        type: "string"
                                      },
                                      tolerations: {
                                        description:
                                          "If specified, the pod's tolerations.",
                                        items: {
                                          description:
                                            "The pod this Toleration is attached to tolerates any taint that matches the triple <key,value,effect> using the matching operator <operator>.",
                                          properties: {
                                            effect: {
                                              description:
                                                "Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.",
                                              type: "string"
                                            },
                                            key: {
                                              description:
                                                "Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.",
                                              type: "string"
                                            },
                                            operator: {
                                              description:
                                                "Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.",
                                              type: "string"
                                            },
                                            tolerationSeconds: {
                                              description:
                                                "TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.",
                                              format: "int64",
                                              type: "integer"
                                            },
                                            value: {
                                              description:
                                                "Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.",
                                              type: "string"
                                            }
                                          },
                                          type: "object"
                                        },
                                        type: "array"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              serviceType: {
                                description:
                                  "Optional service type for Kubernetes solver service",
                                type: "string"
                              }
                            },
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      selector: {
                        description:
                          "Selector selects a set of DNSNames on the Certificate resource that should be solved using this challenge solver. If not specified, the solver will be treated as the 'default' solver with the lowest priority, i.e. if any other solver has a more specific match, it will be used instead.",
                        properties: {
                          dnsNames: {
                            description:
                              "List of DNSNames that this solver will be used to solve. If specified and a match is found, a dnsNames selector will take precedence over a dnsZones selector. If multiple solvers match with the same dnsNames value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          dnsZones: {
                            description:
                              "List of DNSZones that this solver will be used to solve. The most specific DNS zone match specified here will take precedence over other DNS zone matches, so a solver specifying sys.example.com will be selected over one specifying example.com for the domain www.sys.example.com. If multiple solvers match with the same dnsZones value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          matchLabels: {
                            additionalProperties: {
                              type: "string"
                            },
                            description:
                              "A label selector that is used to refine the set of certificate's that this challenge solver will apply to.",
                            type: "object"
                          }
                        },
                        type: "object"
                      }
                    },
                    type: "object"
                  },
                  token: {
                    description:
                      "The ACME challenge token for this challenge. This is the raw value returned from the ACME server.",
                    type: "string"
                  },
                  type: {
                    description:
                      'The type of ACME challenge this resource represents. One of "HTTP-01" or "DNS-01".',
                    enum: ["HTTP-01", "DNS-01"],
                    type: "string"
                  },
                  url: {
                    description:
                      "The URL of the ACME Challenge resource for this challenge. This can be used to lookup details about the status of this challenge.",
                    type: "string"
                  },
                  wildcard: {
                    description:
                      "wildcard will be true if this challenge is for a wildcard identifier, for example '*.example.com'.",
                    type: "boolean"
                  }
                },
                required: [
                  "authorizationURL",
                  "dnsName",
                  "issuerRef",
                  "key",
                  "solver",
                  "token",
                  "type",
                  "url"
                ],
                type: "object"
              },
              status: {
                properties: {
                  presented: {
                    description:
                      "presented will be set to true if the challenge values for this challenge are currently 'presented'. This *does not* imply the self check is passing. Only that the values have been 'submitted' for the appropriate challenge mechanism (i.e. the DNS01 TXT record has been presented, or the HTTP01 configuration has been configured).",
                    type: "boolean"
                  },
                  processing: {
                    description:
                      "Used to denote whether this challenge should be processed or not. This field will only be set to true by the 'scheduling' component. It will only be set to false by the 'challenges' controller, after the challenge has reached a final state or timed out. If this field is set to false, the challenge controller will not take any more action.",
                    type: "boolean"
                  },
                  reason: {
                    description:
                      "Contains human readable information on why the Challenge is in the current state.",
                    type: "string"
                  },
                  state: {
                    description:
                      "Contains the current 'state' of the challenge. If not set, the state of the challenge is unknown.",
                    enum: [
                      "valid",
                      "ready",
                      "pending",
                      "processing",
                      "invalid",
                      "expired",
                      "errored"
                    ],
                    type: "string"
                  }
                },
                type: "object"
              }
            },
            required: ["metadata", "spec"],
            type: "object"
          }
        },
        served: true,
        storage: false,
        subresources: {
          status: {}
        }
      },
      {
        additionalPrinterColumns: [
          {
            jsonPath: ".status.state",
            name: "State",
            type: "string"
          },
          {
            jsonPath: ".spec.dnsName",
            name: "Domain",
            type: "string"
          },
          {
            jsonPath: ".status.reason",
            name: "Reason",
            priority: 1,
            type: "string"
          },
          {
            description:
              "CreationTimestamp is a timestamp representing the server time when this object was created. It is not guaranteed to be set in happens-before order across separate operations. Clients may not set this value. It is represented in RFC3339 form and is in UTC.",
            jsonPath: ".metadata.creationTimestamp",
            name: "Age",
            type: "date"
          }
        ],
        name: "v1",
        schema: {
          openAPIV3Schema: {
            description:
              "Challenge is a type to represent a Challenge request with an ACME server",
            properties: {
              apiVersion: {
                description:
                  "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources",
                type: "string"
              },
              kind: {
                description:
                  "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds",
                type: "string"
              },
              metadata: {
                type: "object"
              },
              spec: {
                properties: {
                  authorizationURL: {
                    description:
                      "The URL to the ACME Authorization resource that this challenge is a part of.",
                    type: "string"
                  },
                  dnsName: {
                    description:
                      "dnsName is the identifier that this challenge is for, e.g. example.com. If the requested DNSName is a 'wildcard', this field MUST be set to the non-wildcard domain, e.g. for `*.example.com`, it must be `example.com`.",
                    type: "string"
                  },
                  issuerRef: {
                    description:
                      "References a properly configured ACME-type Issuer which should be used to create this Challenge. If the Issuer does not exist, processing will be retried. If the Issuer is not an 'ACME' Issuer, an error will be returned and the Challenge will be marked as failed.",
                    properties: {
                      group: {
                        description: "Group of the resource being referred to.",
                        type: "string"
                      },
                      kind: {
                        description: "Kind of the resource being referred to.",
                        type: "string"
                      },
                      name: {
                        description: "Name of the resource being referred to.",
                        type: "string"
                      }
                    },
                    required: ["name"],
                    type: "object"
                  },
                  key: {
                    description:
                      "The ACME challenge key for this challenge For HTTP01 challenges, this is the value that must be responded with to complete the HTTP01 challenge in the format: `<private key JWK thumbprint>.<key from acme server for challenge>`. For DNS01 challenges, this is the base64 encoded SHA256 sum of the `<private key JWK thumbprint>.<key from acme server for challenge>` text that must be set as the TXT record content.",
                    type: "string"
                  },
                  solver: {
                    description:
                      "Contains the domain solving configuration that should be used to solve this challenge resource.",
                    properties: {
                      dns01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the DNS01 challenge flow.",
                        properties: {
                          acmeDNS: {
                            description:
                              "Use the 'ACME DNS' (https://github.com/joohoi/acme-dns) API to manage DNS01 challenge records.",
                            properties: {
                              accountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              host: {
                                type: "string"
                              }
                            },
                            required: ["accountSecretRef", "host"],
                            type: "object"
                          },
                          akamai: {
                            description:
                              "Use the Akamai DNS zone management API to manage DNS01 challenge records.",
                            properties: {
                              accessTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              clientTokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              serviceConsumerDomain: {
                                type: "string"
                              }
                            },
                            required: [
                              "accessTokenSecretRef",
                              "clientSecretSecretRef",
                              "clientTokenSecretRef",
                              "serviceConsumerDomain"
                            ],
                            type: "object"
                          },
                          azureDNS: {
                            description:
                              "Use the Microsoft Azure DNS API to manage DNS01 challenge records.",
                            properties: {
                              clientID: {
                                description:
                                  "if both this and ClientSecret are left unset MSI will be used",
                                type: "string"
                              },
                              clientSecretSecretRef: {
                                description:
                                  "if both this and ClientID are left unset MSI will be used",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              environment: {
                                enum: [
                                  "AzurePublicCloud",
                                  "AzureChinaCloud",
                                  "AzureGermanCloud",
                                  "AzureUSGovernmentCloud"
                                ],
                                type: "string"
                              },
                              hostedZoneName: {
                                type: "string"
                              },
                              resourceGroupName: {
                                type: "string"
                              },
                              subscriptionID: {
                                type: "string"
                              },
                              tenantID: {
                                description:
                                  "when specifying ClientID and ClientSecret then this field is also needed",
                                type: "string"
                              }
                            },
                            required: ["resourceGroupName", "subscriptionID"],
                            type: "object"
                          },
                          cloudDNS: {
                            description:
                              "Use the Google Cloud DNS API to manage DNS01 challenge records.",
                            properties: {
                              hostedZoneName: {
                                description:
                                  "HostedZoneName is an optional field that tells cert-manager in which Cloud DNS zone the challenge record has to be created. If left empty cert-manager will automatically choose a zone.",
                                type: "string"
                              },
                              project: {
                                type: "string"
                              },
                              serviceAccountSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["project"],
                            type: "object"
                          },
                          cloudflare: {
                            description:
                              "Use the Cloudflare API to manage DNS01 challenge records.",
                            properties: {
                              apiKeySecretRef: {
                                description:
                                  "API key to use to authenticate with Cloudflare. Note: using an API token to authenticate is now the recommended method as it allows greater control of permissions.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              apiTokenSecretRef: {
                                description:
                                  "API token used to authenticate with Cloudflare.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              },
                              email: {
                                description:
                                  "Email of the account, only required when using API key based authentication.",
                                type: "string"
                              }
                            },
                            type: "object"
                          },
                          cnameStrategy: {
                            description:
                              "CNAMEStrategy configures how the DNS01 provider should handle CNAME records when found in DNS zones.",
                            enum: ["None", "Follow"],
                            type: "string"
                          },
                          digitalocean: {
                            description:
                              "Use the DigitalOcean DNS API to manage DNS01 challenge records.",
                            properties: {
                              tokenSecretRef: {
                                description:
                                  "A reference to a specific 'key' within a Secret resource. In some instances, `key` is a required field.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["tokenSecretRef"],
                            type: "object"
                          },
                          rfc2136: {
                            description:
                              'Use RFC2136 ("Dynamic Updates in the Domain Name System") (https://datatracker.ietf.org/doc/rfc2136/) to manage DNS01 challenge records.',
                            properties: {
                              nameserver: {
                                description:
                                  "The IP address or hostname of an authoritative DNS server supporting RFC2136 in the form host:port. If the host is an IPv6 address it must be enclosed in square brackets (e.g [2001:db8::1]) ; port is optional. This field is required.",
                                type: "string"
                              },
                              tsigAlgorithm: {
                                description:
                                  "The TSIG Algorithm configured in the DNS supporting RFC2136. Used only when ``tsigSecretSecretRef`` and ``tsigKeyName`` are defined. Supported values are (case-insensitive): ``HMACMD5`` (default), ``HMACSHA1``, ``HMACSHA256`` or ``HMACSHA512``.",
                                type: "string"
                              },
                              tsigKeyName: {
                                description:
                                  "The TSIG Key name configured in the DNS. If ``tsigSecretSecretRef`` is defined, this field is required.",
                                type: "string"
                              },
                              tsigSecretSecretRef: {
                                description:
                                  "The name of the secret containing the TSIG value. If ``tsigKeyName`` is defined, this field is required.",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["nameserver"],
                            type: "object"
                          },
                          route53: {
                            description:
                              "Use the AWS Route53 API to manage DNS01 challenge records.",
                            properties: {
                              accessKeyID: {
                                description:
                                  "The AccessKeyID is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata see: https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                type: "string"
                              },
                              hostedZoneID: {
                                description:
                                  "If set, the provider will manage only this zone in Route53 and will not do an lookup using the route53:ListHostedZonesByName api call.",
                                type: "string"
                              },
                              region: {
                                description:
                                  "Always set the region when using AccessKeyID and SecretAccessKey",
                                type: "string"
                              },
                              role: {
                                description:
                                  "Role is a Role ARN which the Route53 provider will assume using either the explicit credentials AccessKeyID/SecretAccessKey or the inferred credentials from environment variables, shared credentials file or AWS Instance metadata",
                                type: "string"
                              },
                              secretAccessKeySecretRef: {
                                description:
                                  "The SecretAccessKey is used for authentication. If not set we fall-back to using env vars, shared credentials file or AWS Instance metadata https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials",
                                properties: {
                                  key: {
                                    description:
                                      "The key of the entry in the Secret resource's `data` field to be used. Some instances of this field may be defaulted, in others it may be required.",
                                    type: "string"
                                  },
                                  name: {
                                    description:
                                      "Name of the resource being referred to. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names",
                                    type: "string"
                                  }
                                },
                                required: ["name"],
                                type: "object"
                              }
                            },
                            required: ["region"],
                            type: "object"
                          },
                          webhook: {
                            description:
                              "Configure an external webhook based DNS01 challenge solver to manage DNS01 challenge records.",
                            properties: {
                              config: {
                                description:
                                  "Additional configuration that should be passed to the webhook apiserver when challenges are processed. This can contain arbitrary JSON data. Secret values should not be specified in this stanza. If secret values are needed (e.g. credentials for a DNS service), you should use a SecretKeySelector to reference a Secret resource. For details on the schema of this field, consult the webhook provider implementation's documentation.",
                                "x-kubernetes-preserve-unknown-fields": true
                              },
                              groupName: {
                                description:
                                  "The API group name that should be used when POSTing ChallengePayload resources to the webhook apiserver. This should be the same as the GroupName specified in the webhook provider implementation.",
                                type: "string"
                              },
                              solverName: {
                                description:
                                  "The name of the solver to use, as defined in the webhook provider implementation. This will typically be the name of the provider, e.g. 'cloudflare'.",
                                type: "string"
                              }
                            },
                            required: ["groupName", "solverName"],
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      http01: {
                        description:
                          "Configures cert-manager to attempt to complete authorizations by performing the HTTP01 challenge flow. It is not possible to obtain certificates for wildcard domain names (e.g. `*.example.com`) using the HTTP01 challenge mechanism.",
                        properties: {
                          ingress: {
                            description:
                              "The ingress based HTTP01 challenge solver will solve challenges by creating or modifying Ingress resources in order to route requests for '/.well-known/acme-challenge/XYZ' to 'challenge solver' pods that are provisioned by cert-manager for each Challenge to be completed.",
                            properties: {
                              class: {
                                description:
                                  "The ingress class to use when creating Ingress resources to solve ACME challenges that use this challenge solver. Only one of 'class' or 'name' may be specified.",
                                type: "string"
                              },
                              ingressTemplate: {
                                description:
                                  "Optional ingress template used to configure the ACME challenge solver ingress used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the ingress used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver ingress.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              name: {
                                description:
                                  "The name of the ingress resource that should have ACME challenge solving routes inserted into it in order to solve HTTP01 challenges. This is typically used in conjunction with ingress controllers like ingress-gce, which maintains a 1:1 mapping between external IPs and ingress resources.",
                                type: "string"
                              },
                              podTemplate: {
                                description:
                                  "Optional pod template used to configure the ACME challenge solver pods used for HTTP01 challenges",
                                properties: {
                                  metadata: {
                                    description:
                                      "ObjectMeta overrides for the pod used to solve HTTP01 challenges. Only the 'labels' and 'annotations' fields may be set. If labels or annotations overlap with in-built values, the values here will override the in-built values.",
                                    properties: {
                                      annotations: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Annotations that should be added to the create ACME HTTP01 solver pods.",
                                        type: "object"
                                      },
                                      labels: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "Labels that should be added to the created ACME HTTP01 solver pods.",
                                        type: "object"
                                      }
                                    },
                                    type: "object"
                                  },
                                  spec: {
                                    description:
                                      "PodSpec defines overrides for the HTTP01 challenge solver pod. Only the 'priorityClassName', 'nodeSelector', 'affinity', 'serviceAccountName' and 'tolerations' fields are supported currently. All other fields will be ignored.",
                                    properties: {
                                      affinity: {
                                        description:
                                          "If specified, the pod's scheduling constraints",
                                        properties: {
                                          nodeAffinity: {
                                            description:
                                              "Describes node affinity scheduling rules for the pod.",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "An empty preferred scheduling term matches all objects with implicit weight 0 (i.e. it's a no-op). A null preferred scheduling term matches no objects (i.e. is also a no-op).",
                                                  properties: {
                                                    preference: {
                                                      description:
                                                        "A node selector term, associated with the corresponding weight.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "preference",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to an update), the system may or may not try to eventually evict the pod from its node.",
                                                properties: {
                                                  nodeSelectorTerms: {
                                                    description:
                                                      "Required. A list of node selector terms. The terms are ORed.",
                                                    items: {
                                                      description:
                                                        "A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "A list of node selector requirements by node's labels.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchFields: {
                                                          description:
                                                            "A list of node selector requirements by node's fields.",
                                                          items: {
                                                            description:
                                                              "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "The label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    type: "array"
                                                  }
                                                },
                                                required: ["nodeSelectorTerms"],
                                                type: "object"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAffinity: {
                                            description:
                                              "Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          },
                                          podAntiAffinity: {
                                            description:
                                              "Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)).",
                                            properties: {
                                              preferredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  'The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.',
                                                items: {
                                                  description:
                                                    "The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)",
                                                  properties: {
                                                    podAffinityTerm: {
                                                      description:
                                                        "Required. A pod affinity term, associated with the corresponding weight.",
                                                      properties: {
                                                        labelSelector: {
                                                          description:
                                                            "A label query over a set of resources, in this case pods.",
                                                          properties: {
                                                            matchExpressions: {
                                                              description:
                                                                "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                              items: {
                                                                description:
                                                                  "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                                properties: {
                                                                  key: {
                                                                    description:
                                                                      "key is the label key that the selector applies to.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  operator: {
                                                                    description:
                                                                      "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                    type:
                                                                      "string"
                                                                  },
                                                                  values: {
                                                                    description:
                                                                      "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                    items: {
                                                                      type:
                                                                        "string"
                                                                    },
                                                                    type:
                                                                      "array"
                                                                  }
                                                                },
                                                                required: [
                                                                  "key",
                                                                  "operator"
                                                                ],
                                                                type: "object"
                                                              },
                                                              type: "array"
                                                            },
                                                            matchLabels: {
                                                              additionalProperties: {
                                                                type: "string"
                                                              },
                                                              description:
                                                                'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                              type: "object"
                                                            }
                                                          },
                                                          type: "object"
                                                        },
                                                        namespaces: {
                                                          description:
                                                            'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                          items: {
                                                            type: "string"
                                                          },
                                                          type: "array"
                                                        },
                                                        topologyKey: {
                                                          description:
                                                            "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                          type: "string"
                                                        }
                                                      },
                                                      required: ["topologyKey"],
                                                      type: "object"
                                                    },
                                                    weight: {
                                                      description:
                                                        "weight associated with matching the corresponding podAffinityTerm, in the range 1-100.",
                                                      format: "int32",
                                                      type: "integer"
                                                    }
                                                  },
                                                  required: [
                                                    "podAffinityTerm",
                                                    "weight"
                                                  ],
                                                  type: "object"
                                                },
                                                type: "array"
                                              },
                                              requiredDuringSchedulingIgnoredDuringExecution: {
                                                description:
                                                  "If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.",
                                                items: {
                                                  description:
                                                    "Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running",
                                                  properties: {
                                                    labelSelector: {
                                                      description:
                                                        "A label query over a set of resources, in this case pods.",
                                                      properties: {
                                                        matchExpressions: {
                                                          description:
                                                            "matchExpressions is a list of label selector requirements. The requirements are ANDed.",
                                                          items: {
                                                            description:
                                                              "A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.",
                                                            properties: {
                                                              key: {
                                                                description:
                                                                  "key is the label key that the selector applies to.",
                                                                type: "string"
                                                              },
                                                              operator: {
                                                                description:
                                                                  "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                                                type: "string"
                                                              },
                                                              values: {
                                                                description:
                                                                  "values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.",
                                                                items: {
                                                                  type: "string"
                                                                },
                                                                type: "array"
                                                              }
                                                            },
                                                            required: [
                                                              "key",
                                                              "operator"
                                                            ],
                                                            type: "object"
                                                          },
                                                          type: "array"
                                                        },
                                                        matchLabels: {
                                                          additionalProperties: {
                                                            type: "string"
                                                          },
                                                          description:
                                                            'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                                                          type: "object"
                                                        }
                                                      },
                                                      type: "object"
                                                    },
                                                    namespaces: {
                                                      description:
                                                        'namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod\'s namespace"',
                                                      items: {
                                                        type: "string"
                                                      },
                                                      type: "array"
                                                    },
                                                    topologyKey: {
                                                      description:
                                                        "This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.",
                                                      type: "string"
                                                    }
                                                  },
                                                  required: ["topologyKey"],
                                                  type: "object"
                                                },
                                                type: "array"
                                              }
                                            },
                                            type: "object"
                                          }
                                        },
                                        type: "object"
                                      },
                                      nodeSelector: {
                                        additionalProperties: {
                                          type: "string"
                                        },
                                        description:
                                          "NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/",
                                        type: "object"
                                      },
                                      priorityClassName: {
                                        description:
                                          "If specified, the pod's priorityClassName.",
                                        type: "string"
                                      },
                                      serviceAccountName: {
                                        description:
                                          "If specified, the pod's service account",
                                        type: "string"
                                      },
                                      tolerations: {
                                        description:
                                          "If specified, the pod's tolerations.",
                                        items: {
                                          description:
                                            "The pod this Toleration is attached to tolerates any taint that matches the triple <key,value,effect> using the matching operator <operator>.",
                                          properties: {
                                            effect: {
                                              description:
                                                "Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.",
                                              type: "string"
                                            },
                                            key: {
                                              description:
                                                "Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.",
                                              type: "string"
                                            },
                                            operator: {
                                              description:
                                                "Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.",
                                              type: "string"
                                            },
                                            tolerationSeconds: {
                                              description:
                                                "TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.",
                                              format: "int64",
                                              type: "integer"
                                            },
                                            value: {
                                              description:
                                                "Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.",
                                              type: "string"
                                            }
                                          },
                                          type: "object"
                                        },
                                        type: "array"
                                      }
                                    },
                                    type: "object"
                                  }
                                },
                                type: "object"
                              },
                              serviceType: {
                                description:
                                  "Optional service type for Kubernetes solver service",
                                type: "string"
                              }
                            },
                            type: "object"
                          }
                        },
                        type: "object"
                      },
                      selector: {
                        description:
                          "Selector selects a set of DNSNames on the Certificate resource that should be solved using this challenge solver. If not specified, the solver will be treated as the 'default' solver with the lowest priority, i.e. if any other solver has a more specific match, it will be used instead.",
                        properties: {
                          dnsNames: {
                            description:
                              "List of DNSNames that this solver will be used to solve. If specified and a match is found, a dnsNames selector will take precedence over a dnsZones selector. If multiple solvers match with the same dnsNames value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          dnsZones: {
                            description:
                              "List of DNSZones that this solver will be used to solve. The most specific DNS zone match specified here will take precedence over other DNS zone matches, so a solver specifying sys.example.com will be selected over one specifying example.com for the domain www.sys.example.com. If multiple solvers match with the same dnsZones value, the solver with the most matching labels in matchLabels will be selected. If neither has more matches, the solver defined earlier in the list will be selected.",
                            items: {
                              type: "string"
                            },
                            type: "array"
                          },
                          matchLabels: {
                            additionalProperties: {
                              type: "string"
                            },
                            description:
                              "A label selector that is used to refine the set of certificate's that this challenge solver will apply to.",
                            type: "object"
                          }
                        },
                        type: "object"
                      }
                    },
                    type: "object"
                  },
                  token: {
                    description:
                      "The ACME challenge token for this challenge. This is the raw value returned from the ACME server.",
                    type: "string"
                  },
                  type: {
                    description:
                      'The type of ACME challenge this resource represents. One of "HTTP-01" or "DNS-01".',
                    enum: ["HTTP-01", "DNS-01"],
                    type: "string"
                  },
                  url: {
                    description:
                      "The URL of the ACME Challenge resource for this challenge. This can be used to lookup details about the status of this challenge.",
                    type: "string"
                  },
                  wildcard: {
                    description:
                      "wildcard will be true if this challenge is for a wildcard identifier, for example '*.example.com'.",
                    type: "boolean"
                  }
                },
                required: [
                  "authorizationURL",
                  "dnsName",
                  "issuerRef",
                  "key",
                  "solver",
                  "token",
                  "type",
                  "url"
                ],
                type: "object"
              },
              status: {
                properties: {
                  presented: {
                    description:
                      "presented will be set to true if the challenge values for this challenge are currently 'presented'. This *does not* imply the self check is passing. Only that the values have been 'submitted' for the appropriate challenge mechanism (i.e. the DNS01 TXT record has been presented, or the HTTP01 configuration has been configured).",
                    type: "boolean"
                  },
                  processing: {
                    description:
                      "Used to denote whether this challenge should be processed or not. This field will only be set to true by the 'scheduling' component. It will only be set to false by the 'challenges' controller, after the challenge has reached a final state or timed out. If this field is set to false, the challenge controller will not take any more action.",
                    type: "boolean"
                  },
                  reason: {
                    description:
                      "Contains human readable information on why the Challenge is in the current state.",
                    type: "string"
                  },
                  state: {
                    description:
                      "Contains the current 'state' of the challenge. If not set, the state of the challenge is unknown.",
                    enum: [
                      "valid",
                      "ready",
                      "pending",
                      "processing",
                      "invalid",
                      "expired",
                      "errored"
                    ],
                    type: "string"
                  }
                },
                type: "object"
              }
            },
            required: ["metadata", "spec"],
            type: "object"
          }
        },
        served: true,
        storage: true,
        subresources: {
          status: {}
        }
      }
    ]
  },
  status: {
    acceptedNames: {
      kind: "",
      plural: ""
    },
    conditions: [],
    storedVersions: []
  }
};
