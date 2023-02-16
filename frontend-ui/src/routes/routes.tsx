import React, { Suspense } from "react";
import ROUTES, { RenderRoutes } from "./RenderRoutes";
import SuspenseSpinner from "components/SuspenseFallback";

export function routes() {
    return (
        <Suspense fallback={<SuspenseSpinner />}>
            <RenderRoutes routes={ROUTES} />
        </Suspense>
    );
}