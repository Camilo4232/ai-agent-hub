# 🐙 Cómo Subir el Proyecto a GitHub

El repositorio Git ya está inicializado y el commit inicial está hecho. Ahora solo necesitas conectarlo a GitHub.

## 🚀 Opción 1: Crear Nuevo Repositorio en GitHub (Recomendado)

### Paso 1: Crear el Repositorio

1. Ve a https://github.com
2. Click en el botón **"+"** (arriba derecha) → **"New repository"**
3. Completa:
   - **Repository name**: `ai-agent-hub` (o el nombre que prefieras)
   - **Description**: `AI Agent Hub with ERC-8004, A2A, and X402 protocols - Real on-chain payments`
   - **Visibility**:
     - ✅ Public (si quieres compartirlo)
     - ⚠️ Private (si es solo para ti)
   - **NO** marques "Initialize with README" (ya tenemos uno)
   - **NO** agregues .gitignore (ya lo tenemos)
   - **NO** agregues License (ya está incluida)
4. Click **"Create repository"**

### Paso 2: Conectar tu Repo Local

GitHub te mostrará instrucciones. Copia y ejecuta:

```bash
cd ai-agent-hub

# Agregar el remote de GitHub
git remote add origin https://github.com/TU_USUARIO/ai-agent-hub.git

# Renombrar rama a main (si prefieres main en vez de master)
git branch -M main

# Subir el código
git push -u origin main
```

✅ **¡Listo!** Tu proyecto está en GitHub.

---

## 🔐 Opción 2: Con SSH (Más Seguro)

Si tienes SSH configurado:

```bash
cd ai-agent-hub
git remote add origin git@github.com:TU_USUARIO/ai-agent-hub.git
git branch -M main
git push -u origin main
```

---

## ✅ Verificar que Funcionó

1. Refresca la página de tu repositorio en GitHub
2. Deberías ver todos los archivos del proyecto
3. El README.md se mostrará automáticamente

---

## 📝 Futuras Actualizaciones

Cuando hagas cambios al proyecto:

```bash
# Ver qué cambió
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

---

## 🔒 Importante: Archivo .env

**El archivo `.env` NO se sube a GitHub** (está en `.gitignore`).

Esto es **CRÍTICO** porque contiene:
- Tu clave privada
- Tu API key de Infura/Alchemy
- Direcciones de contratos

✅ `.env` → Ignorado (seguro)
✅ `.env.example` → Sí se sube (es solo plantilla)

---

## 📋 README Badges (Opcional)

Puedes agregar badges al README.md para que se vea profesional:

```markdown
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Node](https://img.shields.io/badge/Node-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Network](https://img.shields.io/badge/Network-Sepolia-orange)
```

---

## 🌟 Hacer el Repo Destacado

En tu repositorio GitHub:

1. Ve a **"About"** (esquina superior derecha)
2. Click en el ícono de engranaje ⚙️
3. Agrega:
   - **Description**: Descripción corta
   - **Website**: Tu demo o docs
   - **Topics**: `blockchain`, `ethereum`, `ai-agents`, `web3`, `usdc`, `erc-8004`, `smart-contracts`
4. Click **"Save changes"**

---

## 🔗 Estructura del Repo en GitHub

Tu repo se verá así:

```
ai-agent-hub/
├── 📄 README.md               ← Se muestra automáticamente
├── 📂 contracts/              ← Smart contracts
├── 📂 backend/                ← Servidor API
├── 📂 frontend/               ← Interfaces web
├── 📂 agents/                 ← Agentes de ejemplo
├── 📂 scripts/                ← Setup y utilidades
├── 📄 LICENSE                 ← MIT License
└── 📚 Docs/                   ← Todas las guías .md
```

---

## 🎯 Comandos Git Útiles

```bash
# Ver historial de commits
git log --oneline

# Ver diferencias
git diff

# Descartar cambios locales
git checkout -- archivo.js

# Ver ramas
git branch

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Ver remote configurado
git remote -v
```

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"

```bash
# Ver qué remote tienes
git remote -v

# Cambiar el remote
git remote set-url origin https://github.com/TU_USUARIO/ai-agent-hub.git
```

### Error: "failed to push"

```bash
# Primero hacer pull
git pull origin main --rebase

# Luego push
git push origin main
```

### Error: "Permission denied (publickey)"

Si usas SSH y falla:

1. Usa HTTPS en su lugar
2. O configura tu SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## 📊 Estado Actual del Repo

```bash
# Ver estado del commit
cd ai-agent-hub
git log
```

Deberías ver:

```
commit b732aca...
Author: TU_NOMBRE
Date: ...

    Initial commit: AI Agent Hub with ERC-8004, A2A, and X402 protocols

    - Smart contracts for on-chain payments
    - Backend API with blockchain integration
    - Web3 frontend with MetaMask support
    ...
```

---

## 🎉 Próximos Pasos

Una vez en GitHub:

1. **Compartir el repo** con colaboradores
2. **Crear GitHub Pages** para la documentación
3. **Configurar Actions** para CI/CD (opcional)
4. **Agregar Issues** para tracking de tareas
5. **Crear Releases** cuando despliegues contratos

---

**¿Listo para subirlo a GitHub? Ejecuta:**

```bash
# Crea el repo en GitHub primero, luego:
git remote add origin https://github.com/TU_USUARIO/ai-agent-hub.git
git push -u origin main
```

🎯 **Ya tienes Git configurado localmente, solo falta conectarlo a GitHub!**
