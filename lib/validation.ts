import { normalizePlate } from "@/lib/format";

const CHILEAN_PLATE_REGEX = /^[A-Z]{4}\d{2}$/;
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatThousands(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(onlyDigits(value) || 0);
  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatMoneyInput(value: string) {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  return formatThousands(digits);
}

export function parseMoneyInput(value: string) {
  const digits = onlyDigits(value);
  return digits ? Number(digits) : 0;
}

export function sanitizeDecimalInput(value: string, maxDecimals = 1) {
  const sanitized = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const [integerPart = "", decimalPart = ""] = sanitized.split(".");

  if (!sanitized) {
    return "";
  }

  if (sanitized.includes(".")) {
    return `${integerPart}.${decimalPart.slice(0, maxDecimals)}`;
  }

  return integerPart;
}

export function formatChileanPlate(value: string) {
  const normalized = normalizePlate(value).slice(0, 6);

  if (normalized.length <= 4) {
    return normalized;
  }

  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
}

export function isValidChileanPlate(value: string) {
  return CHILEAN_PLATE_REGEX.test(normalizePlate(value));
}

export function isValidEmail(value: string) {
  return SIMPLE_EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  const digits = onlyDigits(trimmed);
  return digits.length >= 8 && digits.length <= 15 && /^[+\d\s()-]+$/.test(trimmed);
}

export function isPositiveInteger(value: string) {
  const digits = onlyDigits(value);
  return Boolean(digits) && Number(digits) > 0;
}
