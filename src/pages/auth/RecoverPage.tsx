import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

const recoverSchema = z.object({
  email: z.string().email('Email inválido'),
})

type RecoverForm = z.infer<typeof recoverSchema>

export default function RecoverPage() {
  const { recoverPassword } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<RecoverForm>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: RecoverForm) => {
    setIsLoading(true)
    const { error } = await recoverPassword(data.email)
    setIsLoading(false)

    if (error) {
      toast({ title: 'Erro ao solicitar', description: error, variant: 'destructive' })
    } else {
      setSent(true)
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-fade-in-up">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-1 items-center pb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            {sent
              ? 'Enviamos as instruções para o seu email'
              : 'Informe seu email para receber um link de redefinição'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Solicitar Link
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/login">Voltar para o Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
        {!sent && (
          <CardFooter className="justify-center border-t pt-6 text-sm text-slate-500">
            <Link
              to="/login"
              className="flex items-center text-slate-600 font-medium hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
