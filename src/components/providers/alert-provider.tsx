"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export function AlertDialogComponent({
  title,
  text,
  action,
  onCancel,
  canCancel,
}: {
  title: string;
  text: string;
  action: undefined | (() => void);
  onCancel: () => void;
  canCancel: boolean;
}) {
  const handleActionClick = () => {
    if (typeof action !== "undefined") {
      action();
    }
    onCancel();
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-screen z-40 flex items-center justify-center bg-[#00000050]"
      onClick={() => {
        if (canCancel) onCancel();
      }}
    >
      <div
        className="w-11/12 max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <div className="text-2xl text-text-primary">{title}</div>}
        {text && <div className="mt-2 text-xl text-gray-700">{text}</div>}

        <div className="mt-6 flex gap-3">
          {canCancel && (
            <div
              onClick={onCancel}
              className="h-12 flex-1 cursor-pointer select-none rounded-xl border border-gray-300 bg-white text-center text-lg text-gray-700 shadow-md flex items-center justify-center"
            >
              ยกเลิก
            </div>
          )}
          <div
            onClick={handleActionClick}
            className="h-12 flex-1 cursor-pointer select-none rounded-xl bg-text-primary text-center text-lg text-white shadow-md flex items-center justify-center"
          >
            {typeof action === "undefined" ? "ปิด" : "ยืนยัน"}
          </div>
        </div>
      </div>
    </div>
  );
}

const AlertContext = createContext(
  (
    title: string,
    text: string,
    action: undefined | (() => void),
    canCancel: boolean,
  ) => {
    return [title, text, action, canCancel];
  },
);

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [action, setAction] = useState<undefined | (() => void)>(undefined);
  const [canCancel, setCanCancel] = useState<boolean>(false);

  const onChangeAlert = useCallback(
    (
      title: string,
      text: string,
      action: undefined | (() => void),
      canCancel: boolean,
    ) => {
      setTitle(title);
      setText(text);
      setAction(() => action);
      setCanCancel(canCancel);
      return [title, text, action, canCancel];
    },
    [],
  );

  const onCancel = () => {
    setTitle("");
    setText("");
    setAction(undefined);
  };

  return (
    <AlertContext.Provider value={onChangeAlert}>
      {(title != "" || text != "") && (
        <AlertDialogComponent
          title={title}
          text={text}
          action={action}
          onCancel={onCancel}
          canCancel={canCancel}
        />
      )}
      {children}
    </AlertContext.Provider>
  );
}

export const useAlertContext = () => useContext(AlertContext);
