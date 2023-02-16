import { useEffect } from "react";
import { Prompt } from "react-router-dom";

export const useBeforeUnload = ({ when, message }) => {
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (when) {
                event.preventDefault();
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [when, message]);
};

export const usePrompt = (props) => {
    useBeforeUnload(props);
    return () => <Prompt {...props} />;
};
