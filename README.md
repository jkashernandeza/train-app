# TrAIn — Adaptive Running & Strength Coach 🏃‍♂️🏋️‍♀️🤖

**TrAIn** es un entrenador inteligente y adaptativo de carrera y fuerza impulsado por Inteligencia Artificial (Google Gemini AI) e integrado con el ecosistema **Garmin Connect**. 

La aplicación combina métricas de rendimiento en tiempo real con datos cualitativos (check-ins subjetivos de fatiga y molestias) para adaptar automáticamente las rutinas de entrenamiento, reduciendo el riesgo de sobreentrenamiento y previniendo lesiones.

---

## 💡 Filosofía Anti-Lesiones (Anti-Injury Philosophy)

A diferencia de los planes de entrenamiento rígidos o tradicionales:
1. **Regulación Dinámica por Fatiga y RPE**: Cada sesión finalizada requiere un check-in rápido de esfuerzo percibido (RPE), nivel de energía y posibles molestias corporales.
2. **Prevención Proactiva de Lesiones**: Si detecta dolor persistente o valores inusuales de fatiga muscular/articular, el motor adaptativo impulsado por Gemini reestructura inmediatamente el volumen, la intensidad o sustituye sesiones de carrera por trabajo de fuerza regenerativo o descanso activo.
3. **Periodización Integrada Carrera + Fuerza**: TrAIn sincroniza las rutinas de fuerza (diseñadas para estabilidad biomecánica, core y tren inferior) con las cargas de volumen de carrera.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Expo](https://expo.dev/) (SDK 57) + [React Native](https://reactnative.dev/) (React 19)
- **Enrutamiento**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Base de Datos Local**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (`openDatabaseSync` API moderna)
- **Almacenamiento Seguro**: `expo-secure-store` (para credenciales y tokens)
- **IA Generativa**: `@google/genai` (Google Gemini SDK)
- **Iconografía y UI**: `lucide-react-native`, `react-native-svg`, `@react-native-community/slider`
- **Integración Garmin**: Garmin Connect API / Client Sync

---

## 📂 Arquitectura de Carpetas

```text
train-app/
├── app/                      # Rutas e interfaz principal (Expo Router)
│   ├── (tabs)/               # Navegación por pestañas
│   │   ├── index.tsx         # Dashboard / Resumen de entrenamiento
│   │   ├── two.tsx           # Vista secundaria / Planificación
│   │   └── _layout.tsx       # Configuración de Tabs & Header TrAIn
│   ├── _layout.tsx           # Root Layout y Providers
│   └── modal.tsx             # Modales de aplicación
├── src/                      # Lógica principal del negocio
│   ├── database/             # Gestión de SQLite local
│   │   ├── db.ts             # Inicialización y apertura de base de datos
│   │   ├── schema.ts         # Creación de tablas e índices
│   │   └── queries.ts        # Operaciones CRUD (Activities, CheckIns, Workouts)
│   ├── services/             # Integraciones y clientes externos
│   │   ├── garminClient.ts   # Conector y cliente de Garmin Connect
│   │   ├── geminiCoach.ts    # Motor de entrenamiento con Google Gemini AI
│   │   └── syncService.ts    # Servicio de sincronización background/local
│   ├── components/           # Componentes UI reutilizables
│   │   ├── CheckInModal.tsx  # Modal interactivo de RPE y evaluación de dolor
│   │   ├── WorkoutCard.tsx   # Tarjeta visual de rutina programada
│   │   └── MetricCard.tsx    # Tarjeta de métricas y estadísticas clave
│   └── types/                # Definiciones de TypeScript
│       └── index.ts          # Tipos para Activity, CheckIn, Workout y Telemetría
├── assets/                   # Recursos gráficos (iconos, fuentes, imágenes)
├── app.json                  # Configuración del proyecto Expo (Branding: TrAIn)
└── package.json              # Dependencias del proyecto
```

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/jkashernandeza/train-app.git
   cd train-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npx expo start
   ```

---

## 📜 Licencia

MIT © [jkashernandeza](https://github.com/jkashernandeza)
