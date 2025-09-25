import React, { useState } from "react";
import { api } from "../services/api";
import { User } from "../types";

interface PropiedadesLogin {
  alIniciarSesion: (usuario: User) => void;
}

const Login: React.FC<PropiedadesLogin> = ({ alIniciarSesion }) => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [recordarUsuario, setRecordarUsuario] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreUsuario || !contrasena) {
      setError("Complete todos los campos");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await api.login({
        username: nombreUsuario,
        password: contrasena,
        nombreUsuario: nombreUsuario,
        contrasena: contrasena,
      });
      alIniciarSesion(respuesta.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex login-container">
      <div className="hidden lg:flex flex-col justify-between bg-[#41413d] text-white p-12 w-1/2 login-left-panel">
        <div>
          <h1 className="text-4xl font-bold mb-6">
            Sistema de Gestión Municipal
          </h1>
          <p className="text-xl mb-8">
            Plataforma integral para la gestión de incidentes y servicios
            municipales
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Gestión de incidentes en tiempo real
            </li>
            <li className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Comunicación directa con ciudadanos
            </li>
            <li className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Seguimiento de reportes
            </li>
          </ul>
        </div>
        <div className="text-sm opacity-80">
          {new Date().getFullYear()} Municipalidad. Todos los derechos
          reservados.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white login-form-container">
        <div className="w-full max-w-md">
          <form
            onSubmit={manejarEnvio}
            className="bg-white p-8 rounded-xl shadow-lg space-y-6 login-form border-2 border-gray-100 hover:border-[#41413d]/20 transition-all duration-300"
          >
            <div className="text-center mb-8">
              <div className="lg:hidden mb-4 login-logo-mobile">
                <div className="w-16 h-16 mx-auto bg-[#41413d] rounded-full flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Iniciar sesión
              </h2>
              <p className="text-gray-600">
                Ingresa tus credenciales para acceder
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#41413d] focus:border-transparent"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#41413d] focus:border-transparent"
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarContrasena ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-100 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between login-options">
              <div className="flex items-center">
                <div className="relative flex items-center">
                  <input
                    id="recordar"
                    name="recordar"
                    type="checkbox"
                    checked={recordarUsuario}
                    onChange={(e) => setRecordarUsuario(e.target.checked)}
                    className="h-4 w-4 appearance-none border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#41413d] focus:ring-offset-2 checked:bg-[#41413d] checked:border-[#41413d]"
                  />
                  <svg
                    className={`absolute left-0 top-0 h-4 w-4 pointer-events-none ${
                      recordarUsuario ? "block" : "hidden"
                    }`}
                    viewBox="0 0 20 20"
                    fill="#ffffff"
                  >
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </div>
                <label
                  htmlFor="recordar"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Recordar usuario
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-[#41413d] hover:text-[#00d8bd] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#41413d] text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d8bd] transition-all duration-300 border-2 border-transparent hover:bg-[#00d8bd] login-button"
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <div className="text-center text-sm login-footer">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{" "}
                <a
                  href="#"
                  className="text-[#41413d] hover:text-[#00d8bd] hover:underline"
                >
                  Contáctanos
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .login-container {
            flex-direction: column;
          }
          .login-left-panel {
            display: none;
          }
          .login-form-container {
            padding: 1.5rem !important;
            width: 100% !important;
          }
          .login-form {
            padding: 1.5rem !important;
            border: 2px solid #41413d20 !important;
            border-radius: 1rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          }
          .login-form input {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            font-size: 0.875rem !important;
          }
          .login-options {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .login-options a {
            font-size: 0.75rem !important;
          }
          .login-button {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .login-footer {
            font-size: 0.75rem !important;
          }
          .login-logo-mobile {
            display: block !important;
            margin: 0 auto 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
