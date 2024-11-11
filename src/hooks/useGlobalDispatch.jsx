import { useDispatch } from "react-redux";

let dispatchSingleton;

export const useGlobalDispatch = () => {
  if (!dispatchSingleton) {
    dispatchSingleton = useDispatch();
  }
  return dispatchSingleton;
};
