import { Redirect } from "expo-router";
import { useAuth } from "./utils/authContext";
import React from "react";

export default function Index() {
    const { authState } = useAuth();

    if (!authState?.isLoggedIn) {
        return <Redirect href="/signIn" />;
    }

    // Role-aware redirect: send admins to admin area, everyone else to user area
    if (authState.role === "admin") {
        return <Redirect href={"/admin" as any} />;
    }

    return <Redirect href={"/user" as any} />;
}