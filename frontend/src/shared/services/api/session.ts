type SessionExpiredHandler = () => void;

let sessionExpireHandler: SessionExpiredHandler | null = null;

export const setSessionExpiredHandler = (
  handler: SessionExpiredHandler | null
) => {
  sessionExpireHandler = handler;
};

export const notifySessionExpired = () => {
  sessionExpireHandler?.();
}