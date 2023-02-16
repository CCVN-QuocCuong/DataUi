import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

/**
 * Component to display toast messages
 * @param {boolean} show
 * @param {string} message
 * @param {string} redirect
 */
export function DataUIToast({ show, message, redirect }) {
    useEffect(() => {
        if (show && message) {
            toast.dismiss();
            toast.success(message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                onClose: () => redirect && (window.location.href = redirect),
            });
        }
    }, [show, message, redirect]);

    return (
        <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
        />
    );
}
