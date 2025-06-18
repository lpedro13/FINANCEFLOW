import React from 'react';

export const formatDateToBrasilia = (dateString) => {
  if (!dateString) return new Date().toISOString(); 
  
  const date = new Date(dateString);
  
  if (dateString.length === 10) { 
    const [year, month, day] = dateString.split('-');
    return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 3, 0, 0)).toISOString();
  }
  
  const brasiliaOffsetMilliseconds = -3 * 60 * 60 * 1000;
  
  const localDateInBrasiliaTimezone = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  if (Math.abs(localDateInBrasiliaTimezone.getTime() - date.getTime()) > Math.abs(brasiliaOffsetMilliseconds)) {
      return new Date(date.getTime() + brasiliaOffsetMilliseconds + (date.getTimezoneOffset() * 60000)).toISOString();
  }
  
  return date.toISOString();
};

export const getCurrentBrasiliaDateISO = () => {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  const year = brasiliaTime.getFullYear();
  const month = (brasiliaTime.getMonth() + 1).toString().padStart(2, '0');
  const day = brasiliaTime.getDate().toString().padStart(2, '0');
  const hours = brasiliaTime.getHours().toString().padStart(2, '0');
  const minutes = brasiliaTime.getMinutes().toString().padStart(2, '0');
  const seconds = brasiliaTime.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
};

export const getFormattedBrasiliaDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(formatDateToBrasilia(dateString));
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

export const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(formatDateToBrasilia(deadline));
    const today = new Date(getCurrentBrasiliaDateISO().split('T')[0] + 'T00:00:00.000Z'); 
    deadlineDate.setUTCHours(0,0,0,0); 
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};