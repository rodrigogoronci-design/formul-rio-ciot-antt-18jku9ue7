import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface CustomInputProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  maxLength?: number
  onChangeTransform?: (val: string) => string
  className?: string
}

export function CustomInput({
  name,
  label,
  type = 'text',
  onChangeTransform,
  ...props
}: CustomInputProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...props}
              {...field}
              type={type}
              value={field.value || ''}
              onChange={(e) => {
                const val = onChangeTransform ? onChangeTransform(e.target.value) : e.target.value
                field.onChange(val)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface CustomSelectProps {
  name: string
  label: string
  options: { label: string; value: string }[]
  placeholder?: string
}

export function CustomSelect({
  name,
  label,
  options,
  placeholder = 'Selecione...',
}: CustomSelectProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
