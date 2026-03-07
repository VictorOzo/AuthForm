#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-auth-form-app}"

npx create-next-app@latest "$APP_NAME" \
  --typescript \
  --app \
  --src-dir \
  --use-npm \
  --yes

cd "$APP_NAME"

npm install @reduxjs/toolkit react-redux zod

# Ensure requested structure exists under src/app for a src-dir Next.js app.
mkdir -p "src/app/(auth)/login" \
         "src/app/(auth)/signup" \
         "src/app/(app)/dashboard" \
         "src/app/(app)/profile" \
         "src/app/(app)/settings" \
         "src/app/api/auth/signup" \
         "src/app/api/auth/login" \
         "src/app/api/auth/logout" \
         "src/app/api/auth/me" \
         "src/app/api/user/profile" \
         "src/store"

cat > src/app/layout.tsx <<'TSX'
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
TSX

cat > src/app/providers.tsx <<'TSX'
"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
TSX

cat > "src/app/(auth)/layout.tsx" <<'TSX'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
TSX

cat > "src/app/(auth)/login/page.tsx" <<'TSX'
export default function LoginPage() {
  return <main>Login page</main>;
}
TSX

cat > "src/app/(auth)/signup/page.tsx" <<'TSX'
export default function SignupPage() {
  return <main>Signup page</main>;
}
TSX

cat > "src/app/(app)/layout.tsx" <<'TSX'
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
TSX

cat > "src/app/(app)/dashboard/page.tsx" <<'TSX'
export default function DashboardPage() {
  return <main>Dashboard page</main>;
}
TSX

cat > "src/app/(app)/profile/page.tsx" <<'TSX'
export default function ProfilePage() {
  return <main>Profile page</main>;
}
TSX

cat > "src/app/(app)/settings/page.tsx" <<'TSX'
export default function SettingsPage() {
  return <main>Settings page</main>;
}
TSX

cat > src/app/api/_db.ts <<'TS'
export const db = {
  users: [] as Array<{ id: string; email: string; password: string; name?: string }>,
};
TS

cat > src/app/api/auth/signup/route.ts <<'TS'
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "signup ok" });
}
TS

cat > src/app/api/auth/login/route.ts <<'TS'
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "login ok" });
}
TS

cat > src/app/api/auth/logout/route.ts <<'TS'
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "logout ok" });
}
TS

cat > src/app/api/auth/me/route.ts <<'TS'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ user: null });
}
TS

cat > src/app/api/user/profile/route.ts <<'TS'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ profile: null });
}

export async function PATCH() {
  return NextResponse.json({ message: "profile updated" });
}
TS

cat > src/store/store.ts <<'TS'
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: { auth: authReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
TS

cat > src/store/hooks.ts <<'TS'
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes();
TS

cat > src/store/authSlice.ts <<'TS'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;
TS

cat > middleware.ts <<'TS'
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
TS

echo "Scaffold complete in ./$APP_NAME"
