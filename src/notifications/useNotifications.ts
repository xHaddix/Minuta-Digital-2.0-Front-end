import { useEffect } from "react";
import { connectNotifications } from "../services/notifications-service";

interface UseNotificationsOptions {
  accessToken: string | null | undefined;
  residentialComplexId: string | null | undefined;
}

export const VISITOR_UPDATED_EVENT = "minuta-digital-visitor-updated";

export const useNotifications = ({
  accessToken,
  residentialComplexId,
}: UseNotificationsOptions): void => {
  useEffect(() => {
    if (!accessToken || !residentialComplexId) return;

    const socket = connectNotifications(accessToken);
    socket.on("visitor_updated", (visitor) => {
      window.dispatchEvent(
        new CustomEvent(VISITOR_UPDATED_EVENT, { detail: visitor }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, residentialComplexId]);
};
