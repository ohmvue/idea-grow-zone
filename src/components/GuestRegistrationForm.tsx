import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, BedDouble, User, CreditCard, Banknote, Smartphone, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, "Nome completo deve ter no mínimo 3 caracteres")
    .max(150, "Nome muito longo"),
  documento: z
    .string()
    .trim()
    .min(7, "Documento inválido (CPF ou RG)")
    .max(18, "Documento inválido"),
  checkin: z.date({ required_error: "Selecione a data de check-in" }),
  checkout: z.date({ required_error: "Selecione a data de check-out" }),
  valorReserva: z
    .string()
    .trim()
    .min(1, "Informe o valor da reserva")
    .refine((v) => !isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) > 0, {
      message: "Valor inválido",
    }),
  formaPagamento: z.enum(["pix", "debito", "credito", "dinheiro"], {
    required_error: "Selecione a forma de pagamento",
  }),
}).refine((data) => data.checkout > data.checkin, {
  message: "Check-out deve ser após o check-in",
  path: ["checkout"],
});

type FormValues = z.infer<typeof formSchema>;

interface Hospede {
  id: string;
  nomeCompleto: string;
  documento: string;
  checkin: Date;
  checkout: Date;
  valorReserva: string;
  formaPagamento: string;
}

const pagamentoLabel: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pix: { label: "Pix", icon: <Smartphone className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  debito: { label: "Débito", icon: <CreditCard className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
  credito: { label: "Crédito", icon: <CreditCard className="h-3.5 w-3.5" />, color: "bg-purple-100 text-purple-700 border-purple-200" },
  dinheiro: { label: "Dinheiro", icon: <Banknote className="h-3.5 w-3.5" />, color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export function GuestRegistrationForm() {
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: "",
      documento: "",
      valorReserva: "",
    },
  });

  function onSubmit(values: FormValues) {
    const novoHospede: Hospede = {
      id: crypto.randomUUID(),
      nomeCompleto: values.nomeCompleto,
      documento: values.documento,
      checkin: values.checkin,
      checkout: values.checkout,
      valorReserva: values.valorReserva,
      formaPagamento: values.formaPagamento,
    };
    setHospedes((prev) => [novoHospede, ...prev]);
    setSuccess(true);
    form.reset();
    setTimeout(() => setSuccess(false), 3000);
  }

  function removerHospede(id: string) {
    setHospedes((prev) => prev.filter((h) => h.id !== id));
  }

  const formatarValor = (v: string) =>
    Number(v.replace(",", ".")).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <BedDouble className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">HostelPro</h1>
          </div>
          <p className="text-primary-foreground/75 text-sm">Sistema de Cadastro de Hóspedes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Form Card */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <User className="h-5 w-5 text-primary" />
              Cadastro de Hóspede
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Hóspede cadastrado com sucesso!</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome Completo */}
                  <FormField
                    control={form.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Maria Silva Santos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Documento */}
                  <FormField
                    control={form.control}
                    name="documento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF ou RG</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 123.456.789-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valor da Reserva */}
                  <FormField
                    control={form.control}
                    name="valorReserva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Reserva (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 150,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Check-in */}
                  <FormField
                    control={form.control}
                    name="checkin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Check-in</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  : "Selecionar data"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Check-out */}
                  <FormField
                    control={form.control}
                    name="checkout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Check-out</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  : "Selecionar data"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Forma de Pagamento */}
                <FormField
                  control={form.control}
                  name="formaPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1"
                        >
                          {[
                            { value: "pix", label: "Pix", icon: <Smartphone className="h-5 w-5" /> },
                            { value: "debito", label: "Débito", icon: <CreditCard className="h-5 w-5" /> },
                            { value: "credito", label: "Crédito", icon: <CreditCard className="h-5 w-5" /> },
                            { value: "dinheiro", label: "Dinheiro", icon: <Banknote className="h-5 w-5" /> },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={option.value}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border bg-card p-4 cursor-pointer transition-all hover:bg-secondary",
                                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                                  "peer-data-[state=checked]:text-primary"
                                )}
                              >
                                {option.icon}
                                <span className="text-sm font-medium">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-11 text-base font-semibold" size="lg">
                  Cadastrar Hóspede
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Guest List */}
        {hospedes.length > 0 && (
          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <BedDouble className="h-5 w-5 text-primary" />
                  Hóspedes Cadastrados
                </CardTitle>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full font-medium">
                  {hospedes.length} {hospedes.length === 1 ? "hóspede" : "hóspedes"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-border/50">
              {hospedes.map((hospede) => {
                const pg = pagamentoLabel[hospede.formaPagamento];
                return (
                  <div key={hospede.id} className="py-4 first:pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground truncate">{hospede.nomeCompleto}</span>
                          <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border", pg.color)}>
                            {pg.icon}
                            {pg.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Doc: {hospede.documento}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span>
                            🗓 {format(hospede.checkin, "dd/MM/yyyy", { locale: ptBR })} →{" "}
                            {format(hospede.checkout, "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="font-semibold text-primary">
                            {formatarValor(hospede.valorReserva)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removerHospede(hospede.id)}
                        aria-label="Remover hóspede"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
