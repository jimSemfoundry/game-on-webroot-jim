import { useEffect, useState } from "react";

export function YearMonthDay( { onChange, value }: { onChange: (date: { day: string, month: string, year: string }) => void, value: { day: string, month: string, year: string } } ) {

  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [day, setDay] = useState<string>(''); 

  useEffect(() => {
    setDay(value.day);
    setMonth(value.month);
    setYear(value.year);
  }, [value]);

  // 根据月份和年份计算最大天数
  const getMaxDaysInMonth = (monthValue: number, yearValue: number): number => {
    if (monthValue < 1 || monthValue > 12) return 31;
    if (yearValue < 1900) return 31;

    // 创建日期对象，月份是0索引的，所以需要减1
    const date = new Date(yearValue, monthValue, 0);
    return date.getDate();
  };

  // 处理年份输入限制
  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 限制输入不超过4位数字
    if (inputValue.length > 4) {
      e.target.value = inputValue.slice(0, 4);
      return;
    }

    // 只允许数字输入
    if (inputValue && !/^\d+$/.test(inputValue)) {
      e.target.value = inputValue.replace(/\D/g, '');
      return;
    }

    const value = parseInt(e.target.value);
    if (isNaN(value)) return;

    const currentYear = new Date().getFullYear();
    if (value < 1900) {
      e.target.value = '1900';
      setYear('1900');
    } else if (value > currentYear) {
      e.target.value = currentYear.toString();
      setYear(currentYear.toString());
    } else {
      setYear(e.target.value);
    }
  };

  // 处理年份实时输入限制（防止超过4位）
  const handleYearInputRealTime = (e: React.FormEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value;

    // 限制输入不超过4位数字
    if (inputValue.length > 4) {
      e.currentTarget.value = inputValue.slice(0, 4);
    }

    // 只允许数字输入
    if (inputValue && !/^\d+$/.test(inputValue)) {
      e.currentTarget.value = inputValue.replace(/\D/g, '');
    }

    setYear(e.currentTarget.value);
  };

  const handleMonthInputRealTime = (e: React.FormEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value;
    if (inputValue.length > 2) {
      e.currentTarget.value = inputValue.slice(0, 2);
    }
    if (inputValue && !/^\d+$/.test(inputValue)) {
      e.currentTarget.value = inputValue.replace(/\D/g, '');
    }
    setMonth(e.currentTarget.value);
  };

  // 处理月份输入限制
  const handleMonthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value < 1) {
      e.target.value = '1';
      setMonth('1');
    } else if (value > 12) {
      e.target.value = '12';
      setMonth('12');
    } else {
      setMonth(e.target.value);
    }
    if (day !== '') {
      const dayValue = parseInt(day);
      const monthValue = parseInt(e.target.value);
      const yearValue = parseInt(year) || new Date().getFullYear();
      const maxDays = getMaxDaysInMonth(monthValue, yearValue);

      if (dayValue > maxDays) {
        setDay(maxDays.toString());
      }
    }
  };

  const handleDayInputRealTime = (e: React.FormEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value;
    if (inputValue.length > 2) {
      e.currentTarget.value = inputValue.slice(0, 2);
    }
    if (inputValue && !/^\d+$/.test(inputValue)) {
      e.currentTarget.value = inputValue.replace(/\D/g, '');
    }
    setDay(e.currentTarget.value);
  };

  // 处理日期输入限制
  const handleDayInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const monthValue = parseInt(month) || 1;
    const yearValue = parseInt(year) || new Date().getFullYear();
    const maxDays = getMaxDaysInMonth(monthValue, yearValue);

    if (value < 1) {
      e.target.value = '1';
      setDay('1');
    } else if (value > maxDays) {
      e.target.value = maxDays.toString();
      setDay(maxDays.toString());
    } else {
      setDay(e.target.value);
    }
  };

  useEffect(() => {
    onChange({day, month, year});
  }, [year, month, day]);

  return (
    <>
      <input type="number"
        className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
        placeholder="Day"
        value={day}
        min="1"
        max={getMaxDaysInMonth(parseInt(month) || 1, parseInt(year) || new Date().getFullYear())}
        onBlur={handleDayInput}
        onInput={handleDayInputRealTime}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <input type="number"
        className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
        placeholder="Month"
        value={month}
        min="1"
        max="12"
        onBlur={handleMonthInput}
        onInput={handleMonthInputRealTime}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <input type="number"
        className="input bg-base-300 w-full border-0 !outline-0 font-semibold px-4 h-12"
        placeholder="Year"
        value={year}
        min="1900"
        max={new Date().getFullYear()}
        onBlur={handleYearInput}
        onInput={handleYearInputRealTime}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </>
  )
}