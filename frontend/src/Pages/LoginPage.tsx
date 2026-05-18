import { useState } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    console.log("Email:", email);
    console.log("Password:", password);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* PANEL IZQUIERDO */}
      <div className="
        hidden
        lg:flex
        lg:w-1/2
        relative
        bg-orange-500
        items-center
        justify-center
        overflow-hidden
      ">

        {/* CIRCULOS */}
        <div className="
          absolute
          -top-20
          -left-20
          w-96
          h-96
          bg-orange-400
          rounded-full
          opacity-40
        "></div>

        <div className="
          absolute
          bottom-0
          right-0
          w-[450px]
          h-[450px]
          bg-orange-300
          rounded-full
          opacity-30
        "></div>

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-lg px-14 text-white">

          {/* LOGO */}
          <div className="
            w-24
            h-24
            rounded-3xl
            bg-white/20
            backdrop-blur-md
            flex
            items-center
            justify-center
            shadow-lg
            mb-10
          ">
            <span className="text-5xl font-extrabold">
              S
            </span>
          </div>

          {/* TITULO */}
          <h1 className="
            text-6xl
            font-extrabold
            leading-tight
            mb-6
          ">
            Sistema Integral
            <br />
            de Gestión
          </h1>

          {/* TEXTO */}
          <p className="
            text-xl
            text-orange-100
            leading-relaxed
          ">
            Plataforma para la gestión de materia prima,
            producción y distribución de balanceado.
          </p>

        </div>

      </div>

      {/* LOGIN */}
      <div className="
        w-full
        lg:w-1/2
        flex
        items-center
        justify-center
        px-8
        py-12
        bg-white
      ">

        <div className="w-full max-w-md">

          {/* HEADER */}
          <div className="mb-10">

            <h1 className="
              text-5xl
              font-extrabold
              text-gray-800
              mb-3
            ">
              Bienvenido
            </h1>

            <p className="text-lg text-gray-500">
              Inicia sesión en tu cuenta
            </p>

          </div>

          {/* EMAIL */}
          <div className="mb-6">

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-3
            ">
              Usuario
            </label>

            <div className="relative">

              <Mail
                size={22}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleLogin()
                }
                className="
                  w-full
                  pl-14
                  pr-4
                  py-4
                  rounded-2xl
                  border
                  border-gray-300
                  bg-gray-50
                  text-lg
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-400
                  focus:border-orange-400
                  transition
                "
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div className="mb-4">

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-3
            ">
              Contraseña
            </label>

            <div className="relative">

              <Lock
                size={22}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleLogin()
                }
                className="
                  w-full
                  pl-14
                  pr-14
                  py-4
                  rounded-2xl
                  border
                  border-gray-300
                  bg-gray-50
                  text-lg
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-400
                  focus:border-orange-400
                  transition
                "
              />

              {/* MOSTRAR PASSWORD */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-orange-500
                "
              >
                {showPassword ? (
                  <EyeOff size={22} />
                ) : (
                  <Eye size={22} />
                )}
              </button>

            </div>

          </div>

          {/* FORGOT */}
          <div className="text-right mb-8">

            <a
              href="#"
              className="
                text-sm
                text-orange-500
                hover:text-orange-600
                font-medium
              "
            >
              ¿Olvidaste tu contraseña?
            </a>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              w-full
              bg-orange-500
              hover:bg-orange-600
              disabled:bg-orange-300
              text-white
              font-bold
              py-4
              rounded-2xl
              text-lg
              shadow-lg
              transition-all
              duration-300
            "
          >
            {loading
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>

          {/* FOOTER */}
          <p className="
            text-center
            text-gray-400
            text-sm
            mt-10
          ">
            © 2026 Sistema de Distribución Balanceado
          </p>

        </div>

      </div>

    </div>
  );
}