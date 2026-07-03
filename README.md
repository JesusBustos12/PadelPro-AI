# PadelPro AI - Instructor Virtual de Pádel

## Descripción
Aplicación web full-stack de alto rendimiento que actúa como un **instructor virtual experto en pádel**, impulsada por la API de Chat Completions de OpenAI (modelo GPT-4o-mini).

El sistema está diseñado con una arquitectura robusta orientada a despliegues en la nube (Serverless), integrando un frontend reactivo con un backend Node.js conectado a una base de datos relacional en TiDB Cloud. La aplicación garantiza seguridad a nivel de endpoints mediante Rate Limiting persistente y una experiencia de usuario (UX) premium con diseño Glassmorphism y temas dinámicos.

## Arquitectura y Características Principales

- **Arquitectura Full-Stack Tipada**: Separación estricta de responsabilidades entre la interfaz (React/TypeScript) y la capa de servicios (Express), asegurando mantenibilidad y escalabilidad del código.
- **Persistencia en la Nube (TiDB / MySQL)**: Gestión integral del estado de la aplicación mediante bases de datos relacionales distribuidas. Los historiales de conversación y el control de límites de peticiones se persisten en TiDB Cloud, garantizando consistencia de datos inquebrantable en entornos Serverless (Vercel).
- **Seguridad y Control de Tráfico**: Implementación de un `Store` personalizado en SQL para el sistema de Rate Limit, permitiendo un control estricto de peticiones por IP que sobrevive a los ciclos de vida efímeros de las funciones serverless. Uso integral de `helmet` para la protección de cabeceras HTTP.
- **Ingeniería de Prompts y Renderizado**: Delimitación estricta del contexto de la IA mediante System Prompts para prevenir desvíos temáticos ("jailbreaks"). Las respuestas son parseadas de forma segura y renderizadas dinámicamente usando Markdown enriquecido.
- **Diseño UI/UX Premium**: Interfaz fluida y responsiva desarrollada con CSS Modules puro. Incluye transiciones optimizadas, tooltips construidos con pseudo-elementos, modo claro/oscuro dinámico y feedback visual inmediato sin depender de librerías de componentes externas.

## Stack Tecnológico
- **Frontend**: React 19, Vite, TypeScript, CSS Modules.
- **Backend**: Node.js, Express, `mysql2` (Connection Pooling).
- **Base de Datos**: TiDB Cloud (MySQL Serverless).
- **Seguridad e Infraestructura**: Vercel (Serverless Functions), Custom SQL Rate Limit Store, Helmet, CORS.
- **Inteligencia Artificial**: OpenAI API (GPT-4o-mini).

## Estructura del Proyecto
```text
padel-pro-ai/
├── server/
│   ├── db.js                 # Configuración del Connection Pool para TiDB
│   ├── index.js              # Entry point del servidor Express y Middlewares
│   ├── rateLimitStore.js     # Implementación custom de persistencia SQL para Rate Limiting
│   └── routes/
│       └── chat.js           # Endpoints de la API y lógica de negocio
├── src/
│   ├── features/
│   │   └── chat/             # Módulo principal (Componentes, Hooks, Types)
│   ├── layout/               # Componentes estructurales (Header, Logo dinámico)
│   ├── styles/               # CSS Global y Sistema de Diseño
│   ├── App.tsx               # Orquestador principal de React
│   └── main.tsx              # Punto de entrada de la SPA
├── vercel.json               # Configuración de enrutamiento para despliegue Serverless
└── package.json              # Gestión de dependencias
```

## Resumen de Competencias Técnicas
Este proyecto evidencia sólidas competencias en ingeniería de software:
- **Diseño de Sistemas Distribuidos:** Adaptación de aplicaciones Node.js para funcionar eficientemente en entornos Serverless sin pérdida de estado (Stateless APIs integradas a TiDB).
- **Desarrollo Backend:** Creación de APIs seguras, manejo de concurrencia mediante Connection Pools y desarrollo de adaptadores personalizados desde cero (Custom SQL Stores).
- **Desarrollo Frontend Moderno:** Dominio del ecosistema React con TypeScript y CSS avanzado para construir interfaces de usuario de alta fidelidad, dinámicas y optimizadas.
- **Integración de IA:** Manejo eficiente de la API de OpenAI con enfoques orientados a producto final (restricciones de contexto estricto, parseo visual, manejo asíncrono).

## Contacto
- **GitHub:** [github.com/JesusBustos12](https://github.com/JesusBustos12)
- **LinkedIn:** [linkedin.com/in/jesus-bustos-arizmendi-325329283](https://www.linkedin.com/in/jesus-bustos-arizmendi-325329283)
- **Correo:** jesusbustosarizmendi0@gmail.com
