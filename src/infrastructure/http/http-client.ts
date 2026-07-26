import axios from "axios";
import { env } from "../configuration/env";

/**
 * Instancia de Axios preconfigurada para hablar con el backend.
 *
 * Centraliza `baseURL`, timeout y headers por defecto. Los componentes no usan
 * Axios directamente: solo los repositorios de infraestructura (DIP).
 */
export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});
