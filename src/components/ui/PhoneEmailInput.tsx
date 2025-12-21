import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { 
  Country, 
  Value, 
  getCountries, 
  getCountryCallingCode, 
  // isValidPhoneNumber, // TODO: 生产环境启用 - 暂时关闭手机号有效性验证，允许输入6位
  parsePhoneNumber,
  formatPhoneNumberIntl
} from 'react-phone-number-input'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import { Search, ChevronDown, X } from 'lucide-react'

// Types
export type PhoneEmailValue = string
export type InputMode = 'email' | 'phone' | 'auto'
export type ValidationState = 'valid' | 'invalid' | 'pending' | 'none'

interface PhoneEmailInputProps {
  value?: PhoneEmailValue
  onChange?: (value: PhoneEmailValue) => void
  onValidationChange?: (isValid: boolean, mode: InputMode) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  defaultCountry?: Country
  countries?: Country[]
  mode?: InputMode
  showValidationIcon?: boolean
  autoFocus?: boolean
  required?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
}

// Enhanced email validation (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Utility functions
const isValidEmail = (email: string): boolean => {
  if (!email || email.length > 254) return false
  const parts = email.split('@')
  if (parts.length !== 2) return false
  const [localPart] = parts
  if (localPart.length > 64) return false
  return EMAIL_REGEX.test(email)
}

const detectInputMode = (input: string): InputMode => {
  if (!input) return 'auto'
  
  // Clear email detection
  if (input.includes('@')) return 'email'
  
  // Phone number detection - starts with + or contains only digits/spaces/dashes/parentheses
  const phonePattern = /^[\d\s\-\(\)\+]+$/
  if (phonePattern.test(input) && (input.startsWith('+') || input.replace(/\D/g, '').length >= 3)) {
    return 'phone'
  }
  
  return 'auto'
}

const extractDigits = (value: string): string => value.replace(/\D/g, '')

const removeLeadingPlus = (value: string): string => value.replace(/^\++/, '')

const buildInternationalFromRaw = (value: string, country: Country): string => {
  const digits = extractDigits(value)

  if (!digits) {
    return ''
  }

  return `+${getCountryCallingCode(country)}${digits}`
}

const formatPhoneForParent = (value: string, country: Country): string => {
  const international = buildInternationalFromRaw(value, country)
  if (!international) return ''

  try {
    const parsed = parsePhoneNumber(international)
    if (parsed) {
      const formatted = `+${parsed.countryCallingCode}-${parsed.nationalNumber}`
      
      // 验证：确保解析后的号码包含原始输入的所有数字
      // 如果解析导致数字丢失（被截断），则返回原始国际格式
      const originalDigits = extractDigits(value)
      const parsedDigits = extractDigits(formatted)
      
      // 只有当解析后的数字位数与原始输入相同或更多时，才使用解析结果
      if (parsedDigits.length >= originalDigits.length) {
        return formatted
      }
    }
  } catch {}

  // 解析失败或导致截断，返回原始国际格式（不带横杠）
  return international
}

const deriveRawFromExternal = (external: string, fallbackCountry: Country): string => {
  if (!external) return ''

  const trimmed = external.trim()
  if (!trimmed) return ''

  const detectedMode = detectInputMode(trimmed)
  if (detectedMode !== 'phone') {
    return trimmed
  }

  const digits = extractDigits(trimmed)

  if (!digits) {
    return ''
  }

  // 如果外部值以 + 开头，尝试提取本地号码部分
  if (trimmed.startsWith('+')) {
    const fallbackCode = getCountryCallingCode(fallbackCountry)
    
    // 简单字符串匹配：如果以 +国家代码 开头，移除它
    if (digits.startsWith(fallbackCode)) {
      return digits.slice(fallbackCode.length)
    }
    
    // 如果包含横杠分隔符（如 +86-13800138000），提取横杠后的部分
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-')
      if (parts.length === 2 && parts[0].startsWith('+')) {
        return parts[1]
      }
    }
    
    // 其他情况返回所有数字（可能是其他国家的号码）
    return digits
  }

  // 如果不以 + 开头，说明是本地号码，直接返回所有数字
  return digits
}

const getFlagAsset = (countryCode?: Country): string => {
  if (!countryCode) return ''
  return `/icons/flags/country/${countryCode.toLowerCase()}.svg`
}

const getBrowserCountryCode = (): Country => {
  try {
    // Try to detect from timezone first
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timezoneToCountry: Record<string, Country> = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US', 
      'America/Chicago': 'US',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Seoul': 'KR',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU',
      'America/Toronto': 'CA',
    }

    if (timezoneToCountry[timezone]) {
      return timezoneToCountry[timezone]
    }

    // Fallback to browser locale
    const locale = navigator.language || navigator.languages?.[0] || 'en-US'
    const countryFromLocale = locale.split('-')[1]?.toUpperCase() as Country
    if (countryFromLocale && getCountries().includes(countryFromLocale)) {
      return countryFromLocale
    }

    return 'US'
  } catch {
    return 'US'
  }
}

// Pre-import available languages to avoid dynamic import issues
import enLocale from 'react-phone-number-input/locale/en.json'
import zhLocale from 'react-phone-number-input/locale/zh.json'
import esLocale from 'react-phone-number-input/locale/es.json'
import frLocale from 'react-phone-number-input/locale/fr.json'
import deLocale from 'react-phone-number-input/locale/de.json'
import itLocale from 'react-phone-number-input/locale/it.json'
import jaLocale from 'react-phone-number-input/locale/ja.json'
import koLocale from 'react-phone-number-input/locale/ko.json'
import ptLocale from 'react-phone-number-input/locale/pt.json'
import ptBRLocale from 'react-phone-number-input/locale/pt-BR.json'
import ruLocale from 'react-phone-number-input/locale/ru.json'
import arLocale from 'react-phone-number-input/locale/ar.json'
import trLocale from 'react-phone-number-input/locale/tr.json'
import nlLocale from 'react-phone-number-input/locale/nl.json'
import plLocale from 'react-phone-number-input/locale/pl.json'
import viLocale from 'react-phone-number-input/locale/vi.json'
import thLocale from 'react-phone-number-input/locale/th.json'
import svLocale from 'react-phone-number-input/locale/sv.json'
import nbLocale from 'react-phone-number-input/locale/nb.json'
import fiLocale from 'react-phone-number-input/locale/fi.json'
import czLocale from 'react-phone-number-input/locale/cz.json'
import elLocale from 'react-phone-number-input/locale/el.json'
import etLocale from 'react-phone-number-input/locale/et.json'
import skLocale from 'react-phone-number-input/locale/sk.json'
import heLocale from 'react-phone-number-input/locale/he.json'
import hyLocale from 'react-phone-number-input/locale/hy.json'
import caLocale from 'react-phone-number-input/locale/ca.json'
import uaLocale from 'react-phone-number-input/locale/ua.json'

// Language pack mapping
const languagePackMap: Record<string, any> = {
  'en': enLocale,
  'zh': zhLocale,
  'zh-CN': zhLocale,
  'zh-TW': zhLocale,
  'es': esLocale,
  'fr': frLocale,
  'de': deLocale,
  'it': itLocale,
  'ja': jaLocale,
  'ko': koLocale,
  'pt': ptLocale,
  'pt-BR': ptBRLocale,
  'ru': ruLocale,
  'ar': arLocale,
  'tr': trLocale,
  'nl': nlLocale,
  'pl': plLocale,
  'vi': viLocale,
  'th': thLocale,
  'id': enLocale, // Indonesian - fallback to English
  'fil': enLocale, // Filipino - fallback to English
  'uk': uaLocale, // Ukrainian
  'sv': svLocale,
  'da': enLocale, // Danish - fallback to English
  'no': nbLocale, // Norwegian
  'fi': fiLocale,
  'cs': czLocale, // Czech
  'hu': enLocale, // Hungarian - fallback to English
  'ro': enLocale, // Romanian - fallback to English
  'bg': enLocale, // Bulgarian - fallback to English
  'el': elLocale, // Greek
  'fa': enLocale, // Persian - fallback to English
  'bn': enLocale, // Bengali - fallback to English
  'et': etLocale, // Estonian
  'lt': enLocale, // Lithuanian - fallback to English
  'lv': enLocale, // Latvian - fallback to English
  'sk': skLocale, // Slovak
  'sl': enLocale, // Slovenian - fallback to English
  'he': heLocale, // Hebrew
  'hy': hyLocale, // Armenian
  'ca': caLocale  // Catalan
}

// Function to get country names for a specific language
const getCountryNames = (language: string): any => {
  return languagePackMap[language] || enLocale
}

export const PhoneEmailInput = forwardRef<HTMLInputElement, PhoneEmailInputProps>(
  (
    {
      value = '',
      onChange,
      onValidationChange,
      placeholder = 'Enter email or phone number',
      disabled = false,
      className = '',
      defaultCountry,
      countries = getCountries(),
      mode = 'auto',
      showValidationIcon = true,
      autoFocus = false,
      required = false,
      ...props
    },
    ref
  ) => {
    // Get current language
    const { i18n } = useTranslation()
    const currentLanguage = i18n.language
    
    // Get country names based on current language - now synchronous
    const countryNames = useMemo(() => {
      return getCountryNames(currentLanguage)
    }, [currentLanguage])
    
    // State
    const [rawValue, setRawValue] = useState<string>(value)
    const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry || getBrowserCountryCode())
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [focusedIndex, setFocusedIndex] = useState(-1)
    
    // Refs
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const optionRefs = useRef<(HTMLLIElement | null)[]>([])

    // Combine refs
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef

    // Derived state
    const currentMode = mode === 'auto' ? detectInputMode(rawValue) : mode
    const isEmailMode = currentMode === 'email'
    const isPhoneMode = currentMode === 'phone'
    
    const digitsOnlyValue = useMemo(() => extractDigits(rawValue), [rawValue])

    // Show country selector when in phone mode and has significant input
    const showCountrySelector = isPhoneMode && digitsOnlyValue.length >= 3

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
      if (!searchTerm) return countries
      return countries.filter(country => {
        const countryName = (countryNames[country] || country)?.toLowerCase() || ''
        const callingCode = getCountryCallingCode(country)
        const searchLower = searchTerm.toLowerCase()
        return countryName.includes(searchLower) || 
               callingCode.includes(searchTerm) ||
               `+${callingCode}`.includes(searchTerm)
      })
    }, [countries, searchTerm, countryNames])

    // Validation
    const validationState = useMemo((): ValidationState => {
      if (!rawValue.trim()) return 'none'
      
      if (isEmailMode) {
        return isValidEmail(rawValue) ? 'valid' : 'invalid'
      }
      
      if (isPhoneMode) {
        const digits = digitsOnlyValue

        if (!digits) {
          return 'invalid'
        }

        // TODO: 生产环境启用 - 暂时关闭手机号有效性验证，允许输入6位
        // const internationalValue = buildInternationalFromRaw(rawValue, selectedCountry)
        // if (internationalValue && isValidPhoneNumber(internationalValue)) {
        //   return 'valid'
        // }
        // return digits.length >= 7 ? 'invalid' : 'pending'

        // 临时验证逻辑：允许至少6位数字
        if (digits.length >= 6) {
          return 'valid'
        }
        return 'pending'
      }
      
      return 'pending'
    }, [rawValue, isEmailMode, isPhoneMode, digitsOnlyValue, selectedCountry])

    const isValid = validationState === 'valid' || validationState === 'none'

    // Effects
    useEffect(() => {
      const nextMode = mode === 'auto' ? detectInputMode(value) : mode

      if (nextMode === 'phone') {
        const nextRawValue = deriveRawFromExternal(value, selectedCountry)

        if (nextRawValue !== rawValue) {
          setRawValue(nextRawValue)
        }

        const trimmed = value.trim()
        if (trimmed.startsWith('+')) {
          const digits = extractDigits(trimmed)
          if (digits) {
            try {
              const parsed = parsePhoneNumber(`+${digits}`)
              if (parsed?.country && parsed.country !== selectedCountry) {
                setSelectedCountry(parsed.country)
              }
            } catch {}
          }
        }

        return
      }

      if (value !== rawValue) {
        setRawValue(value)
      }
    }, [value, mode, rawValue, selectedCountry])

    useEffect(() => {
      if (!defaultCountry || rawValue.trim()) return
      if (defaultCountry !== selectedCountry) {
        setSelectedCountry(defaultCountry)
      }
    }, [defaultCountry, rawValue, selectedCountry])

    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(isValid, currentMode)
      }
    }, [isValid, currentMode, onValidationChange])

    // Auto-focus
    useEffect(() => {
      if (autoFocus && combinedRef.current) {
        combinedRef.current.focus()
      }
    }, [autoFocus])

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false)
          setSearchTerm('')
          setFocusedIndex(-1)
        }
      }

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isDropdownOpen])

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isDropdownOpen) return

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            setFocusedIndex(prev => 
              prev < filteredCountries.length - 1 ? prev + 1 : 0
            )
            break
          case 'ArrowUp':
            event.preventDefault()
            setFocusedIndex(prev => 
              prev > 0 ? prev - 1 : filteredCountries.length - 1
            )
            break
          case 'Enter':
            event.preventDefault()
            if (focusedIndex >= 0 && filteredCountries[focusedIndex]) {
              handleCountrySelect(filteredCountries[focusedIndex])
            }
            break
          case 'Escape':
            event.preventDefault()
            setIsDropdownOpen(false)
            setSearchTerm('')
            setFocusedIndex(-1)
            combinedRef.current?.focus()
            break
        }
      }

      if (isDropdownOpen) {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isDropdownOpen, focusedIndex, filteredCountries])

    // Scroll focused option into view
    useEffect(() => {
      if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
        optionRefs.current[focusedIndex]?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }, [focusedIndex])

    // Handlers
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputWithoutLeadingPlus = removeLeadingPlus(e.target.value)
        const nextMode = mode === 'auto' ? detectInputMode(inputWithoutLeadingPlus) : mode

        // 只在手机号模式下移除 + 号，邮箱模式保留（支持 user+tag@example.com 格式）
        const sanitizedValue = nextMode === 'phone'
          ? inputWithoutLeadingPlus.replace(/\+/g, '')
          : inputWithoutLeadingPlus

        setRawValue(sanitizedValue)
        let nextCountry = selectedCountry

        if (onChange) {
          if (nextMode === 'phone') {
            onChange(formatPhoneForParent(sanitizedValue, nextCountry))
          } else {
            onChange(sanitizedValue)
          }
        }
      },
      [mode, onChange, selectedCountry]
    )

    const handleCountrySelect = useCallback(
      (country: Country) => {
        setSelectedCountry(country)
        setIsDropdownOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)

        if (isPhoneMode && rawValue.trim() !== '') {
          onChange?.(formatPhoneForParent(rawValue, country))
        }

        // Return focus to input
        setTimeout(() => combinedRef.current?.focus(), 0)
      },
      [combinedRef, isPhoneMode, onChange, rawValue]
    )

    const handleDropdownToggle = useCallback(() => {
      if (disabled) return
      setIsDropdownOpen(prev => !prev)
      if (!isDropdownOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    }, [disabled, isDropdownOpen])

    const clearInput = useCallback(() => {
      setRawValue('')
      onChange?.('')
      combinedRef.current?.focus()
    }, [combinedRef, onChange])

    // Format display value for phone numbers
    const displayValue = useMemo(() => {
      if (!rawValue || rawValue.trim() === '') {
        return ''
      }

        if (isPhoneMode) {
          if (showCountrySelector) {
            // 用户输入本地号码，直接显示
            return rawValue
          }

          // 不显示国家选择器时，尝试格式化为国际格式
        const internationalValue = buildInternationalFromRaw(rawValue, selectedCountry)
        if (internationalValue) {
          try {
            return formatPhoneNumberIntl(internationalValue as Value)
          } catch {
            return internationalValue
          }
        }
      }

      return rawValue
    }, [rawValue, isPhoneMode, showCountrySelector, selectedCountry])

    return (
      <div className={cn('phone-email-input-container relative', className)}>
        <div className="join w-full flex">
          {/* Country Selector */}
          {showCountrySelector && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={cn(
                  'btn join-item bg-base-300 hover:bg-base-200 focus:bg-base-200',
                  'min-w-20 gap-2 flex items-center justify-start',
                  'border-0 h-10 sm:h-12 rounded-r-none',
                  disabled && 'btn-disabled'
                )}
                onClick={handleDropdownToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label={`Selected country: ${countryNames[selectedCountry] || selectedCountry}`}
              >
                <img
                  src={getFlagAsset(selectedCountry)}
                  alt={countryNames[selectedCountry] || selectedCountry}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm object-cover"
                />
                <span className="text-sm font-medium">
                  +{getCountryCallingCode(selectedCountry)}
                </span>
                <ChevronDown 
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isDropdownOpen && 'rotate-180'
                  )} 
                />
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-base-200 border border-base-300 rounded-lg shadow-lg min-w-80 max-h-80 overflow-hidden">
                  {/* Search */}
                  <div className="p-3 border-b border-base-300">
                    <div className="relative">
                      <Search className="absolute z-50 left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-sm sm:input-md w-full rounded-field pl-10 bg-base-300 border-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Countries List */}
                  <div className="overflow-y-auto max-h-60 py-2" role="listbox">
                    {filteredCountries.length === 0 ? (
                      <div className="p-3 text-center text-base-content/50 text-sm">
                        No countries found
                      </div>
                    ) : (
                      filteredCountries.map((country, index) => (
                        <li
                          key={country}
                          ref={el => { optionRefs.current[index] = el }}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ml-3 rounded-field',
                            'hover:bg-base-300 focus:bg-base-200',
                            country === selectedCountry && 'bg-primary/10 text-primary',
                            focusedIndex === index && 'bg-base-200'
                          )}
                          onClick={() => handleCountrySelect(country)}
                          role="option"
                          aria-selected={country === selectedCountry}
                          tabIndex={-1}
                        >
                          <img
                            src={getFlagAsset(country)}
                            alt={countryNames[country] || country}
                            className="w-5 h-5 rounded-sm object-cover"
                          />
                          <span className="flex-1 text-sm">
                            {countryNames[country] || country}
                          </span>
                          <span className="text-sm text-base-content/70 font-mono">
                            +{getCountryCallingCode(country)}
                          </span>
                        </li>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Input */}
          <label className={cn(
            'input input-ghost join-item flex-1 bg-base-300 input-md sm:input-lg',
            showCountrySelector ? 'rounded-l-none' : 'rounded-lg',
            disabled && 'input-disabled'
          )}>
            <input
              ref={combinedRef}
              type="text"
              inputMode="text"
              autoComplete={isEmailMode ? 'email' : 'tel'}
              value={displayValue}
              onChange={handleInputChange}
              placeholder={
                isEmailMode 
                  ? 'Enter email address' 
                  : isPhoneMode 
                    ? 'Enter phone number'
                    : placeholder
              }
              disabled={disabled}
              required={required}
              className="grow"
              {...props}
            />

            {/* Clear button */}
            {rawValue && !disabled && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={clearInput}
                aria-label="Clear input"
                tabIndex={-1}
              >
                <X className="w-4 h-4 text-base-content/50" />
              </button>
            )}

          </label>
        </div>

      </div>
    )
  }
)

PhoneEmailInput.displayName = 'PhoneEmailInput'