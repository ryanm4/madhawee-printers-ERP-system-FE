import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDefaultRoute } from "@/lib/permissions";

export default async function HomePage() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    let userRole: string | undefined;
    if (userCookie) {
        try {
            const user = JSON.parse(userCookie) as { user_role?: string };
            userRole = user.user_role;
        } catch {
            userRole = undefined;
        }
    }

    redirect(getDefaultRoute(userRole));
}
