"use client";

import { useState } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const predefinedColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export function ColorPicker({
  value,
  onChange,
  label = "Couleur de vos messages",
}: ColorPickerProps) {
  const [isCustom, setIsCustom] = useState(!predefinedColors.includes(value));

  const handlePredefinedClick = (color: string) => {
    setIsCustom(false);
    onChange(color);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(true);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Couleurs prédéfinies */}
      <div className="grid grid-cols-5 gap-2">
        {predefinedColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
              value === color && !isCustom
                ? "border-gray-800 ring-2 ring-gray-300"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handlePredefinedClick(color)}
            title={`Couleur ${color}`}
          />
        ))}
      </div>

      {/* Séparateur */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500">ou</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Sélecteur de couleur personnalisé */}
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={handleCustomChange}
          className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
          title="Choisir une couleur personnalisée"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setIsCustom(true);
            onChange(e.target.value);
          }}
          placeholder="#3B82F6"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
        />
      </div>

      {/* Aperçu */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Aperçu :</span>
        <div
          className="px-3 py-2 rounded-lg text-white text-sm shadow-sm"
          style={{ backgroundColor: value }}
        >
          Votre message
        </div>
      </div>
    </div>
  );
}
