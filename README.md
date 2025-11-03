# Claude AI en Colombia 🇨🇴

Visualización interactiva y educativa del uso de Claude AI en Colombia, basada en el [Índice Económico de Anthropic](https://huggingface.co/datasets/Anthropic/EconomicIndex).

## 🎯 Características

### Estadísticas Principales
- 📊 Total de conversaciones y porcentaje global
- 👥 Uso per cápita (por cada 100,000 habitantes)
- 📅 Análisis del período: 2025-08-04 a 2025-08-11

### Visualizaciones Incluidas

1. **Comparación Global**
   - Top 10 países a nivel mundial
   - Comparación con países de Latinoamérica

2. **Análisis de Uso**
   - Automatización vs Aumento (cómo se usa la IA)
   - Patrones de colaboración humano-IA
   - Tipos de solicitudes más comunes

3. **Tareas Profesionales**
   - Top 10 tareas económicas según clasificación O*NET
   - Distribución por categorías de trabajo

### 🎨 Diseño

- Interfaz moderna y responsiva
- Explicaciones en lenguaje sencillo para público general
- Gráficos interactivos con Chart.js
- Advertencias claras sobre limitaciones de los datos

## 📊 Sobre los Datos

**Fuente**: Anthropic Economic Index (Release 2025-09-15)

**Importante**:
- Los datos representan una **muestra representativa**, no el total de uso
- Solo incluye Claude AI (Free y Pro)
- Excluye uso empresarial vía API
- Período de análisis: 1 semana (4-11 de agosto, 2025)

## 🚀 Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Chart.js & react-chartjs-2** - Visualización de datos
- **Papa Parse** - Procesamiento de CSV

## 💻 Instalación y Uso

### Prerequisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio (si aplica)
git clone <tu-repo>
cd claude-colombia

# Instalar dependencias
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
claude-colombia/
├── app/
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal con todos los gráficos
├── public/
│   └── data.csv             # Dataset completo (25.5MB)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 📝 Explicación de Métricas

### Patrones de Colaboración
- **Directiva**: Instrucciones directas a Claude
- **Retroalimentación**: Ajustes iterativos con feedback
- **Aprendizaje**: Uso educativo para aprender conceptos
- **Iteración de tareas**: Refinamiento progresivo
- **Validación**: Revisión y verificación de trabajo

### Automatización vs Aumento
- **Automatización**: Claude realiza la tarea completa
- **Aumento**: Claude asiste al humano en la tarea

### Tareas O*NET
Clasificación estándar de ocupaciones del Departamento de Trabajo de EE.UU., que identifica qué tipo de trabajo profesional se realiza con ayuda de Claude.

## 🎓 Uso Educativo

Este proyecto fue creado con fines educativos para:
- Mostrar cómo se está adoptando la IA en Colombia
- Explicar conceptos de IA de manera accesible
- Demostrar análisis de datos con Next.js y TypeScript
- Visualizar datos públicos de forma comprensible

## 📜 Licencia

Los datos del Anthropic Economic Index están disponibles bajo [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

## 🔗 Enlaces

- [Dataset Original](https://huggingface.co/datasets/Anthropic/EconomicIndex)
- [Anthropic](https://www.anthropic.com/)
- [Claude AI](https://www.claude.ai/)

---

Creado con ❤️ para entender el uso de IA en Colombia
