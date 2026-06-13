# PadelPro AI - Instructor Virtual de Pádel (Full-Stack Portafolio)

## Descripción
Aplicación web full-stack que actúa como un **instructor virtual experto en pádel**, utilizando la API de Chat Completions de OpenAI (modelo GPT-4o-mini).  

El usuario puede interactuar con el chatbot para realizar cualquier pregunta relacionada con técnicas, tácticas, reglas o equipamiento de pádel. La IA está programada mediante System Prompts para responder exclusivamente a temas de pádel, de manera estructurada, clara y utilizando formato Markdown para una lectura óptima.

Construida con una arquitectura moderna utilizando **React, Vite, TypeScript y CSS Modules** en el frontend, respaldada por un servidor **Node.js y Express**. El proyecto cuenta con un diseño estético "Premium" (Glassmorphism, Modo Oscuro/Claro, micro-animaciones), seguridad avanzada (Rate Limiting, Helmet) y está empaquetado para un despliegue transparente en entornos Serverless (Vercel).

Perfecto para demostrar habilidades full-stack reales y avanzadas en un portafolio profesional.

## Objetivo
Como desarrollador, creé este proyecto para:

- Mostrar dominio en el desarrollo de Single Page Applications (SPA) modulares con **React y TypeScript**, integradas a un backend propio.
- Integrar de forma segura la API de chat de OpenAI, manejando historiales de conversación (hilos) y formateo avanzado de respuestas.
- Diseñar prompts estratégicos con "Guardrails" para asegurar que la IA se mantenga estrictamente en su rol de instructor de pádel.
- Construir interfaces web altamente pulidas usando **CSS puro (CSS Modules)**, implementando Glassmorphism, temas dinámicos interactivos y animaciones fluidas sin depender de librerías de componentes pesadas.
- Aplicar ingeniería de seguridad web en el backend: protección de cabeceras con Helmet, ocultamiento de API Keys y prevención de abusos económicos con **Rate Limiting** estricto por IP.
- Resolver problemas de infraestructura arquitectónica configurando un monorepo Vite/Express para su correcto funcionamiento y enrutamiento en **Serverless** (Vercel).

## Características
- **Arquitectura Full-Stack Tipada**: Código robusto, modular y escalable gracias a TypeScript, separando claramente las responsabilidades entre la UI (React) y la API (Express).
- **Diseño Premium y Dinámico**: Interfaz minimalista con físicas suaves, tooltips interactivos renderizados por CSS, barras de progreso visuales y soporte nativo para Modo Oscuro/Claro.
- **Seguridad y Rate Limiting**: Limitador de peticiones integrado en el backend (14 mensajes por usuario) para proteger los créditos de OpenAI, emparejado con una UI que muestra el límite de forma amigable.
- **Ingeniería de Prompts y Markdown**: Respuestas enriquecidas renderizadas dinámicamente en el cliente con `react-markdown` (listas, negritas) y delimitadas estrictamente al contexto deportivo.
- **Persistencia Local**: El historial del chat y las preferencias de tema visual se guardan automáticamente en el `localStorage` del navegador para evitar la pérdida de contexto.

## Tecnologías utilizadas
- **Frontend**: React 19, Vite, TypeScript.
- **Backend**: Node.js + Express.
- **Seguridad**: express-rate-limit (mitigación de bots/spam), helmet (cabeceras seguras), cors.
- **Inteligencia Artificial**: OpenAI Chat Completions API (GPT-4o-mini).
- **Estilos**: CSS Modules (Puro), Variables CSS nativas, Glassmorphism.
- **Utilidades UI**: react-markdown (renderizado seguro de texto a HTML), lucide-react (iconografía).
- **Despliegue e Infraestructura**: Preparado nativamente para Vercel (vercel.json, Serverless Functions).

## Estructura del proyecto
padel-pro-ai/
├── server/
│   ├── index.js              # Punto de entrada del servidor Express
│   └── routes/
│       └── chat.js           # Rutas de la API, Rate Limiters e integración OpenAI
├── src/
│   ├── features/
│   │   └── chat/
│   │       ├── components/   # Componentes UI (ChatInput, MessageList, etc.)
│   │       ├── hooks/        # Lógica de estado y llamadas Fetch (useChat, useTheme)
│   │       └── types/        # Interfaces y Definiciones TypeScript
│   ├── layout/               # Componentes estructurales (Header dinámico)
│   ├── styles/               # CSS Global y Sistema de Diseño (Variables)
│   ├── App.tsx               # Orquestador principal de React
│   └── main.tsx              # Punto de entrada de la SPA
├── vercel.json               # Configuración de reescrituras para Serverless
├── package.json              # Gestión unificada de dependencias Full-Stack
└── .env                      # Configuración segura de entorno
```

## Habilidades demostradas
Este proyecto refleja competencias de un desarrollador Full-Stack (Nivel Ssr) listo para aportar valor:

- **Arquitectura de Software:** Separación limpia entre Frontend y Backend en un mismo repositorio, con tipado estricto (TypeScript) e interfaces compartidas mentalmente.
- **Resolución de Problemas de Infraestructura:** Empaquetado y adaptación de aplicaciones híbridas para funcionar en plataformas Serverless, resolviendo el enrutamiento de estáticos vs. APIs.
- **Backend Sólido y Seguro:** Manejo de seguridad integral (Helmet, CORS limitados) y protección económica de endpoints mediante Rate Limiting.
- **Ingeniería de Prompts:** Definición de roles sistémicos estrictos para evitar "jailbreaks" o que la IA responda a temas fuera del alcance del producto.
- **Frontend y Diseño Moderno:** Creación de UI/UX fluida "pixel-perfect", uso avanzado de flexbox, pseudo-elementos, animaciones `@keyframes`, y gestión de estados asíncronos complejos (loading, error, streaming simulado).
- Producto completo, seguro, escalable, visualmente atractivo y listo para producción.

## Notas para empleadores
Este es un proyecto full-stack donde busqué el equilibrio perfecto entre una UI/UX espectacular y un código subyacente seguro y profesional. Demuestra que:

- Entiendo el ciclo completo del desarrollo de una aplicación web, desde la concepción del componente hasta su despliegue en la nube.
- Domino el ecosistema moderno de React (Hooks, Vite, TypeScript) sin perder de vista los fundamentos del CSS nativo para construir diseños personalizados e irrepetibles.
- Me preocupo activamente por la seguridad y los costos de infraestructura (protección de API Keys y Rate Limiting).
- Poseo habilidades para integrar soluciones de Inteligencia Artificial (LLMs) de forma práctica y controlada en productos orientados a usuarios finales.

Estoy 100% listo para aportar valor real en un equipo como Full-Stack Developer. Busco mi primera oportunidad profesional y ¡me encantaría trabajar contigo!

## Contacto
- **GitHub:** github.com/JesusBustos12
- **LinkedIn:** linkedin.com/in/jesus-bustos-arizmendi-325329283
- **Correo:** jesusbustosarizmendi0@gmail.com

¡Gracias por revisar mi trabajo! 🚀
