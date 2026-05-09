import { Eye, EyeOff } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type PasswordInputProps = {
  value: string
  onChange: (value: string) => void
  autoComplete?: 'new-password' | 'current-password' | 'off'
}

export const PasswordInput = ({ value, onChange, autoComplete = 'current-password' }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation()
  const isComposingRef = useRef(false)

  const handleShowPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setShowPassword(!showPassword)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposingRef.current) {
      return
    }
    onChange(e.target.value)
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    onChange((e.target as HTMLInputElement).value)
  }

  return (
    <label className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={t('login:password')}
        value={value}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={handleShowPassword}>
        {showPassword ? (
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-base-content/50" />
        )}
      </button>
    </label>
  )
}
