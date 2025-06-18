import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const getCategoryName = (catIdentifier, allCategories = []) => {
    if (!catIdentifier) return "Sem Categoria";
    if (typeof catIdentifier === 'object' && catIdentifier !== null && catIdentifier.name) {
        return catIdentifier.name;
    }
    if (typeof catIdentifier === 'string') {
        const found = allCategories.find(c => c.id === catIdentifier || c.name === catIdentifier);
        return found ? found.name : catIdentifier;
    }
    return 'Categoria Inválida';
};