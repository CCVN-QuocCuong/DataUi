import { CircularProgress } from "@mui/material";
import "./style.css";
import UserLayout from '../../layouts/User'
import { useCallback } from "react";

export function SuspenseFallback() {
    const user = localStorage.getItem("user")

    const renderFallBack = useCallback(() => {
        if (user) return <UserLayout />
        return (
            <div className="suspense-container">
                <CircularProgress />
            </div>
        )
    },[user])

    return renderFallBack()
}
