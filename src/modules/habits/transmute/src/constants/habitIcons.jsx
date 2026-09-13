/**
 * habitIcons.js — CATÁLOGO PREDICTIVO DE EMANACIONES (Ghost Icons)
 * 
 * Los íconos han sido ordenados según la Jerarquía de Aspiraciones de Éxito:
 * 1. ENERGÍA (Base) 2. FOCO (Proceso) 3. DISCIPLINA (Consolidación) 4. LOGRO (Resultado)
 */

import { Dumbbell, Sunrise, Droplets, Leaf, Wind, Snowflake, Brain, BookOpen, Pencil, Music, Moon, Sun, Heart, Coffee, Users, Eye, Wallet, Flame, Shield, Sparkles, Timer, Bike, Mountain, Footprints, Apple, Bed, Phone, Target, Zap, Hexagon, Laptop, Code, Briefcase, GraduationCap, Languages, Camera, Palette, Microscope, FlaskConical, Home, Brush, Utensils, ShoppingBag, PiggyBank, TrendingUp, Plane, Globe, Map, Smile, Ghost, Infinity as InfinityIcon, Anchor, Trophy, Medal, Rocket, Diamond, Crown, Star, Gem, Compass, Lightbulb, Sword, Key, Lock, Unlock, Waves, Cloud, Umbrella, Gift, Bell } from 'lucide-react';

export const HABIT_ICONS = [
  
  
  
  { key: 'diamond',  label: 'Pureza', Component: Diamond },
  { key: 'target',   label: 'Misión', Component: Target },
  { key: 'zap',      label: 'Impulso', Component: Zap },
  { key: 'rocket',   label: 'Ascenso', Component: Rocket },
  { key: 'flame',    label: 'Fuego', Component: Flame },
  { key: 'trending', label: 'Crecer', Component: TrendingUp },
  { key: 'trophy',   label: 'Triunfo', Component: Trophy },
  { key: 'medal',    label: 'Honor', Component: Medal },
  { key: 'crown',    label: 'Dominio', Component: Crown },
  { key: 'star',     label: 'Brillo', Component: Star },
  { key: 'gem',      label: 'Esencia', Component: Gem },
  { key: 'sparkles', label: 'Idea', Component: Sparkles },
  { key: 'lightbulb', label: 'Luz', Component: Lightbulb },
  
  
  
  
  { key: 'sunrise',  label: 'Alba', Component: Sunrise },
  { key: 'sun',      label: 'Día', Component: Sun },
  { key: 'droplets', label: 'Agua', Component: Droplets },
  { key: 'dumbbell', label: 'Fuerza', Component: Dumbbell },
  { key: 'bike',     label: 'Ritmo', Component: Bike },
  { key: 'heart',    label: 'Vida', Component: Heart },
  { key: 'footprints', label: 'Pasos', Component: Footprints },
  { key: 'mountain', label: 'Cima', Component: Mountain },
  { key: 'snowflake',label: 'Frío', Component: Snowflake },
  { key: 'leaf',     label: 'Natural', Component: Leaf },
  { key: 'apple',    label: 'Cuerpo', Component: Apple },
  
  
  
  
  { key: 'brain',    label: 'Enfoque', Component: Brain },
  { key: 'eye',      label: 'Visión', Component: Eye },
  { key: 'book',     label: 'Lectura', Component: BookOpen },
  { key: 'graduation', label: 'Sabiduría', Component: GraduationCap },
  { key: 'pencil',   label: 'Notas', Component: Pencil },
  { key: 'microscope', label: 'Análisis', Component: Microscope },
  { key: 'flask',    label: 'Alquimia', Component: FlaskConical },
  { key: 'compass',  label: 'Rumbo', Component: Compass },
  { key: 'wind',     label: 'Respiro', Component: Wind },
  { key: 'waves',    label: 'Fluir', Component: Waves },
  
  
  
  
  { key: 'shield',   label: 'Límites', Component: Shield },
  { key: 'sword',    label: 'Voluntad', Component: Sword },
  { key: 'key',      label: 'Llave', Component: Key },
  { key: 'lock',     label: 'Resguardo', Component: Lock },
  { key: 'briefcase', label: 'Obra', Component: Briefcase },
  { key: 'laptop',   label: 'Digital', Component: Laptop },
  { key: 'code',     label: 'Código', Component: Code },
  { key: 'wallet',   label: 'Cartera', Component: Wallet },
  { key: 'piggy',    label: 'Ahorro', Component: PiggyBank },
  { key: 'shopping', label: 'Orden', Component: ShoppingBag },
  { key: 'anchor',   label: 'Ancla', Component: Anchor },
  { key: 'timer',    label: 'Reloj', Component: Timer },
  
  
  
  
  { key: 'users',     label: 'Tribu', Component: Users },
  { key: 'phone',     label: 'Conexión', Component: Phone },
  { key: 'home',      label: 'Hogar', Component: Home },
  { key: 'palette',   label: 'Color', Component: Palette },
  { key: 'brush',     label: 'Arte', Component: Brush },
  { key: 'music',     label: 'Sonido', Component: Music },
  { key: 'camera',    label: 'Captura', Component: Camera },
  { key: 'smile',     label: 'Gozo', Component: Smile },
  { key: 'globe',     label: 'Mundo', Component: Globe },
  { key: 'plane',     label: 'Viaje', Component: Plane },
  { key: 'gift',      label: 'Don', Component: Gift },
  { key: 'bell',      label: 'Llamado', Component: Bell },
  
  
  
  
  { key: 'moon',      label: 'Noche', Component: Moon },
  { key: 'bed',       label: 'Sueño', Component: Bed },
  { key: 'ghost',     label: 'Sombra', Component: Ghost },
  { key: 'infinity',  label: 'Eterno', Component: InfinityIcon },
  { key: 'hexagon',   label: 'Primordial', Component: Hexagon },
  { key: 'cloud',     label: 'Vapor', Component: Cloud },
  { key: 'umbrella',  label: 'Refugio', Component: Umbrella },
];

export const ICON_CATEGORIES = [
  'Éxito', 'Energía', 'Mente', 'Disciplina', 'Creatividad', 'Otros'
];

export const resolveHabitIcon = (key, className = 'w-6 h-6') => {
  const entry = HABIT_ICONS.find(i => i.key === key);
  const IconComponent = entry?.Component || Hexagon;
  return <IconComponent className={className} strokeWidth={1.5} />;
};
