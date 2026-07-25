import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

/** `useDispatch` tipado con el dispatch de la app. */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** `useSelector` tipado con el estado raíz de la app. */
export const useAppSelector = useSelector.withTypes<RootState>();
