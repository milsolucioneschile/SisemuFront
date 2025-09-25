import { useState } from "react";
import Login from "./components/Login";
import VistaControlador from "./components/ControllerView";
import VistaInspector from "./components/InspectorView";
import FormularioOperador from "./components/FormularioNuevoIncidenteOperador";
import FormularioInspector from "./components/FormularioNuevoIncidenteInspector";
import MainLayout from "./components/MainLayout";
import { User } from "./types";
import "./components/CrudComponents.css";

type TipoVista =
  | "login"
  | "controlador"
  | "inspector"
  | "formulario-operador"
  | "formulario-inspector"
  | "editar-incidente-operador"
  | "editar-incidente-inspector"
  | "dashboard";

function App() {
  const [vistaActual, setVistaActual] = useState<TipoVista>("login");
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);
  const [incidenteParaEditar, setIncidenteParaEditar] = useState<any>(null);

  const manejarLogin = (usuario: User) => {
    setUsuarioActual(usuario);
    if (usuario.role === "controlador") {
      setVistaActual("dashboard");
    } else {
      setVistaActual("dashboard");
    }
  };

  const manejarCerrarSesion = () => {
    setUsuarioActual(null);
    setVistaActual("login");
  };

  const irAFormularioOperador = () => {
    setVistaActual("formulario-operador");
  };

  const irAFormularioInspector = () => {
    setVistaActual("formulario-inspector");
  };

  const volverAVistaPrincipal = () => {
    setVistaActual("dashboard");
    setIncidenteParaEditar(null);
  };

  const irAEditarIncidente = (incidente: any) => {
    setIncidenteParaEditar(incidente);
    if (usuarioActual?.role === "controlador") {
      setVistaActual("editar-incidente-operador");
    } else {
      setVistaActual("editar-incidente-inspector");
    }
  };

  const renderizarVistaActual = () => {
    switch (vistaActual) {
      case "login":
        return <Login alIniciarSesion={manejarLogin} />;

      case "dashboard":
        return usuarioActual ? (
          <MainLayout
            usuario={usuarioActual}
            alCerrarSesion={manejarCerrarSesion}
            abrirFormularioOperador={irAFormularioOperador}
            abrirFormularioInspector={irAFormularioInspector}
            onEditarIncidente={irAEditarIncidente}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      case "controlador":
        return usuarioActual ? (
          <VistaControlador
            usuario={usuarioActual}
            alCerrarSesion={manejarCerrarSesion}
            irAFormulario={irAFormularioOperador}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      case "inspector":
        return usuarioActual ? (
          <VistaInspector
            usuario={usuarioActual}
            alCerrarSesion={manejarCerrarSesion}
            irAFormulario={irAFormularioInspector}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      case "formulario-operador":
        return usuarioActual ? (
          <FormularioOperador
            usuario={usuarioActual}
            volverAVista={volverAVistaPrincipal}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      case "formulario-inspector":
        return usuarioActual ? (
          <FormularioInspector
            usuario={usuarioActual}
            volverAVista={volverAVistaPrincipal}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      case "editar-incidente-operador":
        return usuarioActual ? (
          <FormularioOperador
            usuario={usuarioActual}
            volverAVista={volverAVistaPrincipal}
            incidenteParaEditar={incidenteParaEditar}
            modoEdicion={true}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      case "editar-incidente-inspector":
        return usuarioActual ? (
          <FormularioInspector
            usuario={usuarioActual}
            volverAVista={volverAVistaPrincipal}
            incidenteParaEditar={incidenteParaEditar}
            modoEdicion={true}
          />
        ) : (
          <Login alIniciarSesion={manejarLogin} />
        );

      default:
        return <Login alIniciarSesion={manejarLogin} />;
    }
  };

  return <div className="App">{renderizarVistaActual()}</div>;
}

export default App;
