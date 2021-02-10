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

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import * as serviceWorker from "./serviceWorker";
import { RoutesWithSSRAssetRemoval } from "./routes";

Sentry.init({
  dsn: "https://28a6d713adde403aaaab7c7cc36f0383@o476375.ingest.sentry.io/5529515",
  integrations: [
    new Integrations.BrowserTracing(),
  ]
});

const root = document.getElementById("root");

if (process.env.NODE_ENV !== "production") {
  ReactDOM.render(
    <BrowserRouter>
      <RoutesWithSSRAssetRemoval />
    </BrowserRouter>,
    root
  );
} else {
  ReactDOM.hydrate(
    <BrowserRouter>
      <RoutesWithSSRAssetRemoval />
    </BrowserRouter>,
    root
  );
}

serviceWorker.register();
