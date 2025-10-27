import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Country,
  Value,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  formatPhoneNumberIntl
} from 'react-phone-number-input'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Search, ChevronDown } from 'lucide-react'

// Types
export type PhoneEmailValue = string
export type InputMode = 'email' | 'phone' | 'auto'
export type ValidationState = 'valid' | 'invalid' | 'pending' | 'none'

interface PhoneEmailInputProps {
  value?: PhoneEmailValue
  onChange?: (value: PhoneEmailValue) => void
  onChangeCountryCallingCode?: (countryCallingCode: string) => void
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

// const getFlag = (countryCode: Country): string => {
//   if (!countryCode) return ''
//   try {
//     const codePoints = countryCode
//       .toUpperCase()
//       .split('')
//       .map(char => 0x1f1e6 - 65 + char.charCodeAt(0))
//     return String.fromCodePoint(...codePoints)
//   } catch {
//     return ''
//   }
// }

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
      onChangeCountryCallingCode,
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
    const [inputValue, setInputValue] = useState<string>(value)
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
    const currentMode = mode === 'auto' ? detectInputMode(inputValue) : mode
    const isEmailMode = currentMode === 'email'
    const isPhoneMode = currentMode === 'phone'

    // Show country selector when in phone mode and has significant input
    const showCountrySelector = isPhoneMode

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
      if (!inputValue.trim()) return 'none'

      if (isEmailMode) {
        return isValidEmail(inputValue) ? 'valid' : 'invalid'
      }

      if (isPhoneMode) {
        try {
          // First try to validate as-is (international format)
          if (isValidPhoneNumber(inputValue)) {
            return 'valid'
          }

          // If not valid as-is, try with current selected country code
          const digitsOnly = inputValue.replace(/\D/g, '')
          if (digitsOnly.length >= 7) { // Minimum reasonable phone number length
            const countryCallingCode = getCountryCallingCode(selectedCountry)
            const withCountryCode = `+${countryCallingCode}${digitsOnly}`

            if (isValidPhoneNumber(withCountryCode)) {
              return 'valid'
            }
          }

          return 'invalid'
        } catch {
          return 'invalid'
        }
      }

      return 'pending'
    }, [inputValue, isEmailMode, isPhoneMode, selectedCountry])

    const isValid = validationState === 'valid' || validationState === 'none'

    // Effects
    useEffect(() => {
      if (value !== inputValue) {
        setInputValue(value)
      }
    }, [value])

    useEffect(() => {
      if (selectedCountry && onChangeCountryCallingCode) {
        onChangeCountryCallingCode?.(getCountryCallingCode(selectedCountry))
      }
    }, [selectedCountry,onChangeCountryCallingCode])


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
        const newValue = e.target.value

        if (isPhoneMode && showCountrySelector) {
          // When country selector is shown, auto-prepend country code to local input
          const countryCallingCode = getCountryCallingCode(selectedCountry)
          const localInput = newValue.replace(/^\+\d+[\s\-]*/, '') // Remove any country code user might type

          // Only add country code if there's actual local input
          if (localInput && localInput.replace(/\D/g, '').length > 0) {
            const localDigits = localInput.replace(/\D/g, '')
            const fullNumber = `+${countryCallingCode}${localDigits}`
            const formattedNumber = `+${countryCallingCode}-${localDigits}`
            setInputValue(fullNumber) // Store without hyphen internally for display processing
            onChange?.(formattedNumber) // Pass with hyphen for submission
          } else {
            // If no local input, store empty value
            setInputValue('')
            onChange?.('')
          }
        } else {
          // No country selector, use input as-is
          setInputValue(newValue)

          // For phone mode with international format, ensure hyphen format
          if (isPhoneMode && newValue.startsWith('+')) {
            try {
              const parsed = parsePhoneNumber(newValue)
              if (parsed?.country) {
                if (parsed.country !== selectedCountry) {
                  setSelectedCountry(parsed.country)
                }
                // Format with hyphen: +countryCode-localNumber
                const countryCode = getCountryCallingCode(parsed.country)
                const localNumber = newValue.replace(`+${countryCode}`, '').replace(/^[\s\-]*/, '').replace(/\D/g, '')
                if (localNumber) {
                  onChange?.(`+${countryCode}-${localNumber}`)
                } else {
                  onChange?.(newValue)
                }
              } else {
                onChange?.(newValue)
              }
            } catch {
              // If parsing fails, pass as-is
              onChange?.(newValue)
            }
          } else {
            // Email mode or other input
            onChange?.(newValue)
          }
        }
      },
      [onChange, isPhoneMode, selectedCountry, showCountrySelector]
    )

    const handleCountrySelect = useCallback(
      (country: Country) => {
        setSelectedCountry(country)
        setIsDropdownOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)

        // Only update phone number if there's already content in the input
        if (isPhoneMode && inputValue && inputValue.trim() !== '') {
          const newCountryCode = getCountryCallingCode(country)
          const currentCountryCode = getCountryCallingCode(selectedCountry)

          // Extract local number part (remove current country code)
          let localNumber = inputValue

          if (inputValue.startsWith(`+${currentCountryCode}`)) {
            // Remove current country code
            localNumber = inputValue.slice(`+${currentCountryCode}`.length).replace(/^[\s\-]*/, '')
          } else if (inputValue.startsWith('+')) {
            // Remove any country code
            localNumber = inputValue.replace(/^\+\d+[\s\-]*/, '')
          }

          // Only update if there's actual local number content
          if (localNumber && localNumber.replace(/\D/g, '').length > 0) {
            const localDigits = localNumber.replace(/\D/g, '')
            const fullNumber = `+${newCountryCode}${localDigits}`
            const formattedNumber = `+${newCountryCode}-${localDigits}`
            setInputValue(fullNumber) // Store without hyphen internally
            onChange?.(formattedNumber) // Pass with hyphen for submission
          }
        }
        // If input is empty, just change the selected country without adding anything to input

        // Return focus to input
        setTimeout(() => combinedRef.current?.focus(), 0)
      },
      [inputValue, onChange, isPhoneMode, selectedCountry]
    )

    const handleDropdownToggle = useCallback(() => {
      if (disabled) return
      setIsDropdownOpen(prev => !prev)
      if (!isDropdownOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    }, [disabled, isDropdownOpen])



    // Format display value for phone numbers
    const displayValue = useMemo(() => {
      // If no input value, return empty string
      if (!inputValue || inputValue.trim() === '') {
        return ''
      }

      if (isPhoneMode && inputValue) {
        try {
          // If country selector is shown, remove country code from display
          if (showCountrySelector && inputValue.startsWith('+')) {
            const countryCallingCode = getCountryCallingCode(selectedCountry)
            const expectedPrefix = `+${countryCallingCode}`

            if (inputValue.startsWith(expectedPrefix)) {
              // Remove the country code and any following space/dash
              const localNumber = inputValue.slice(expectedPrefix.length).replace(/^[\s\-]+/, '')
              return localNumber || '' // Return empty string if no local number
            }
          }

          // If no country selector, show full international format
          if (!showCountrySelector && inputValue.startsWith('+')) {
            const parsed = parsePhoneNumber(inputValue)
            if (parsed) {
              return formatPhoneNumberIntl(inputValue as Value)
            }
          }

          // For local numbers or when country selector is shown, show as typed (without country code)
          return inputValue
        } catch {
          // Fall back to original value
          return inputValue
        }
      }
      return inputValue
    }, [inputValue, isPhoneMode, showCountrySelector, selectedCountry])

    return (
      <div className={cn('phone-email-input-container relative', className)}>
        <div className="join w-full flex h-12 items-center bg-base-300 rounded-field pl-2 pr-4 gap-2">
          {/* Country Selector */}
          {showCountrySelector && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={cn(
                  'btn join-item bg-base-200 hover:bg-base-200 rounded-sm',
                  'min-w-20 gap-2 flex items-center justify-start',
                  'border-0 h-8',
                  disabled && 'btn-disabled'
                )}
                onClick={handleDropdownToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label={`Selected country: ${countryNames[selectedCountry] || selectedCountry}`}
              >
                {/* <span className="text-lg" aria-hidden="true">
                  {getFlag(selectedCountry)}
                </span> */}
                <div className="w-4 h-4">
                  <img src={`/images/country-flags/${selectedCountry.toLowerCase()}.svg`} className="object-cover" />
                </div>
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
                          {/* <span className="text-lg" aria-hidden="true">
                            {getFlag(country)}
                          </span> */}
                          <div className="w-4 h-4">
                            <img src={`/images/country-flags/${country.toLowerCase()}.svg`} className="object-cover" />
                          </div>
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

          <input
            ref={combinedRef}
            type="text"
            inputMode="text"
            autoComplete='tel'
            value={displayValue}
            onChange={handleInputChange}
            placeholder='00 000 00 00'
            disabled={disabled}
            required={required}
            className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-0 h-12"
            {...props}
          />
        </div>
      </div>
    )
  }
)

PhoneEmailInput.displayName = 'PhoneEmailInput'