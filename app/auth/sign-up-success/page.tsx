import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="text-balance">
            {"We've sent a confirmation link to your email address. Click the link to verify your account and start playing!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
