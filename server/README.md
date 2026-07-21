Sistema de gestión e integración para el área de **Diagnóstico por Imágenes** del Hospital Central.

El proyecto funciona como una **plataforma unificada**, encargada de integrar múltiples sistemas hospitalarios, normalizar datos y servir tanto un backend propio como, a futuro, el frontend estático del sistema.

---

## 🏥 Contexto

El sistema integra actualmente tres plataformas hospitalarias:

- **Sistema de Internación**

  - Gestión de pedidos de estudios de pacientes internados
  - Comentarios y finalización de pedidos

- **Sistema de Guardia**

  - Gestión de pedidos provenientes de la guardia
  - Finalización de estudios

- **Sistema de Consumos Radiográficos**
  - Envío de pedidos a los equipos radiológicos
  - Registro y seguimiento de consumos

Cada uno de estos sistemas posee su propia API y mecanismos de autenticación propios.

---

## 🎯 Objetivos del proyecto

- Centralizar el acceso a múltiples APIs hospitalarias
- Normalizar datos y errores provenientes de sistemas heterogéneos
- Unificar y optimizar la lógica de autenticación
- Exponer endpoints internos claros y consistentes
- Servir el frontend del sistema desde el mismo proyecto
- Facilitar el mantenimiento y la escalabilidad

---

## 🛠️ Stack tecnológico

- **Node.js**
- **TypeScript**
- **Express**
- Arquitectura en capas:
  - routes
  - controllers
  - services
  - middlewares
- Frontend servido como archivos estáticos
- Deploy con **PM2**

---

## 📦 Estado del proyecto

🚧 En desarrollo activo

Actualmente enfocado en:

- Definir una arquitectura base sólida
- Reestructurar los módulos de pedidos (internación y guardia)
- Implementar manejo centralizado de errores
- Optimizar autenticación con reutilización de sesión
- Preparar el proyecto para servir frontend estático

---

## 📁 Estructura general (en progreso)

```txt
src/
├── app.ts
├── server.ts
├── routes/
├── controllers/
├── services/
├── middlewares/
├── utils/
├── types/
└── web/      # frontend estático (futuro)
```

---

## 🧠 Notas

Este proyecto surge como una evolución de un sistema previo llamado solicitudes-rayos, que creció en alcance y complejidad, motivando una reescritura completa con una arquitectura más clara y escalable.
