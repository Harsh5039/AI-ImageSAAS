import { authMiddleware } from "@clerk/nextjs/server";
export default authMiddleware({
  // "/" will be accessible to all users
  publicRoutes: ["/api/webhooks/clerk"],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};