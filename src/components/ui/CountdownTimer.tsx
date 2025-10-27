import { useEffect, useRef, useState } from 'react';

interface CountdownTimerProps {
  expireTime: number; // 过期时间戳（秒）
  className?: string;
}

export const CountdownTimer = ({ expireTime, className = '' }: CountdownTimerProps) => {
  // 使用 useRef 存储倒计时值避免重新渲染
  const timeLeftRef = useRef({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  // 使用 useState 仅用于触发重新渲染
  const [, setForceUpdate] = useState<number>(0);

  // 处理倒计时
  useEffect(() => {
    if (!expireTime) return;

    let timerId: NodeJS.Timeout;

    // 计算并更新剩余时间的函数
    const updateRemainingTime = () => {
      const now = new Date().getTime() / 1000; // 转换为秒
      const difference = expireTime - now;

      if (difference <= 0) {
        // 倒计时结束
        clearTimeout(timerId);
        timeLeftRef.current = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        setForceUpdate(prev => prev + 1);
        return;
      }

      // 计算剩余时间
      const days = Math.floor(difference / (60 * 60 * 24));
      const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = Math.floor(difference % 60);

      timeLeftRef.current = { days, hours, minutes, seconds };
      setForceUpdate(prev => prev + 1);
      
      // 每秒更新一次
      timerId = setTimeout(updateRemainingTime, 1000);
    };

    // 立即执行一次，确保初始值是准确的
    updateRemainingTime();

    return () => {
      clearTimeout(timerId);
    };
  }, [expireTime]);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <div>
        <span className="countdown font-mono">
          <span style={{ '--value': timeLeftRef.current.days } as React.CSSProperties} aria-live="polite">
            {timeLeftRef.current.days}
          </span>
        </span>
        d
      </div>
      <div>
        <span className="countdown font-mono">
          <span style={{ '--value': timeLeftRef.current.hours } as React.CSSProperties} aria-live="polite">
            {timeLeftRef.current.hours}
          </span>
        </span>
        h
      </div>
      <div>
        <span className="countdown font-mono">
          <span style={{ '--value': timeLeftRef.current.minutes } as React.CSSProperties} aria-live="polite">
            {timeLeftRef.current.minutes}
          </span>
        </span>
        m
      </div>
      <div>
        <span className="countdown font-mono">
          <span style={{ '--value': timeLeftRef.current.seconds } as React.CSSProperties} aria-live="polite">
            {timeLeftRef.current.seconds}
          </span>
        </span>
        s
      </div>
    </div>
  );
}; 

interface CountdownTimerPropsStatic {
  expireTime: number; // 过期时间戳（秒）
  className?: string;
}

interface CountdownTimeProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const isGreaterThanOneDay = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours >= 24) return true;
  return false;
};

const isGreaterThanOneHour = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours > 0) return true;
  return false;
};

const isGreaterThanOneMinute = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours > 0) return true;
  if (time.minutes && time.minutes > 0) return true;
  return false;
};

const isGreaterThanOneSecond = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours > 0) return true;
  if (time.minutes && time.minutes > 0) return true;
  if (time.seconds && time.seconds > 0) return true;
  return false;
};

export const CountdownTimerThree = ({ expireTime, className = '' }: CountdownTimerPropsStatic) => {
  // 使用 useRef 存储倒计时值避免重新渲染
  const timeLeftRef = useRef({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 使用 useState 仅用于触发重新渲染
  const [, setForceUpdate] = useState<number>(0);

  // 处理倒计时
  useEffect(() => {
    if (!expireTime) return;

    let timerId: NodeJS.Timeout;

    // 计算并更新剩余时间的函数
    const updateRemainingTime = () => {
      const now = new Date().getTime() / 1000; // 转换为秒
      const difference = expireTime - now;

      if (difference <= 0) {
        // 倒计时结束
        clearTimeout(timerId);
        timeLeftRef.current = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        setForceUpdate(prev => prev + 1);
        return;
      }

      // 计算剩余时间
      const days = Math.floor(difference / (60 * 60 * 24));
      const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = Math.floor(difference % 60);

      timeLeftRef.current = { days, hours, minutes, seconds };
      setForceUpdate(prev => prev + 1);

      // 每秒更新一次
      timerId = setTimeout(updateRemainingTime, 1000);
    };

    // 立即执行一次，确保初始值是准确的
    updateRemainingTime();

    return () => {
      clearTimeout(timerId);
    };
  }, [expireTime]);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {isGreaterThanOneDay(timeLeftRef.current) && (
        <div>
          <span className="countdown font-mono">
            <span style={{ '--value': timeLeftRef.current.days } as React.CSSProperties} aria-live="polite">
              {timeLeftRef.current.days}
            </span>
          </span>
          d
        </div>
      )}
      {isGreaterThanOneHour(timeLeftRef.current) && (
        <div>
          <span className="countdown font-mono">
            <span style={{ '--value': timeLeftRef.current.hours } as React.CSSProperties} aria-live="polite">
              {timeLeftRef.current.hours}
            </span>
          </span>
          h
        </div>
      )}
      {isGreaterThanOneMinute(timeLeftRef.current) && (
        <div>
          <span className="countdown font-mono">
            <span style={{ '--value': timeLeftRef.current.minutes } as React.CSSProperties} aria-live="polite">
              {timeLeftRef.current.minutes}
            </span>
          </span>
          m
        </div>
      )}
      {isGreaterThanOneSecond(timeLeftRef.current) && (
        <div>
          <span className="countdown font-mono">
            <span style={{ '--value': timeLeftRef.current.seconds } as React.CSSProperties} aria-live="polite">
              {timeLeftRef.current.seconds}
            </span>
          </span>
          s
        </div>
      )}
    </div>
  );
}; 