import time
import sys
import os
import msvcrt
import ctypes

user32 = ctypes.windll.user32
KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_UNICODE = 0x0004
VK_RETURN = 0x0D

def picotear(palabra="adelante"):
    """El pajaro picotea la tecla: escribe la palabra y pulsa Enter."""
    for ch in palabra:
        user32.keybd_event(0, ord(ch), KEYEVENTF_UNICODE, 0)
        time.sleep(0.01)
        user32.keybd_event(0, ord(ch), KEYEVENTF_UNICODE | KEYEVENTF_KEYUP, 0)
        time.sleep(0.01)
    user32.keybd_event(VK_RETURN, 0, 0, 0)
    time.sleep(0.01)
    user32.keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, 0)

def main():
    intervalo = 8  # segundos entre cada picotazo
    pausado = False
    palabra = "adelante"

    print("=" * 60)
    print("  PAJARO DE HOMERO (Auto-Adelante Simple)")
    print("=" * 60)
    print(f" Picoteando '{palabra}' cada {intervalo} segundos.")
    print(" Controles:")
    print("   [+] Menos insistente (aumenta segundos)")
    print("   [-] Mas insistente (reduce segundos)")
    print("   [p] Pausar / Reanudar")
    print("   [q] Salir")
    print("=" * 60)
    print("Iniciando en 3 segundos... ¡Haz clic en tu terminal!\n")
    time.sleep(3)

    cuenta = intervalo

    while True:
        # Leer teclas si el usuario toca algo
        if msvcrt.kbhit():
            tecla = msvcrt.getch()
            if tecla in [b'+', b'=']:
                intervalo += 2
                print(f"\n>> Menos insistente: nuevo intervalo = {intervalo}s")
            elif tecla in [b'-', b'_']:
                intervalo = max(2, intervalo - 2)
                print(f"\n>> Mas insistente: nuevo intervalo = {intervalo}s")
            elif tecla in [b'p', b'P', b' ']:
                pausado = not pausado
                estado = "PAUSADO" if pausado else "ACTIVO"
                print(f"\n>> Pajaro {estado}")
            elif tecla in [b'q', b'Q', b'\x1b']:
                print("\n>> Pajaro detenido. Adios!")
                break

        if not pausado:
            sys.stdout.write(f"\r[Pajaro] Picotazo en: {cuenta:2d}s | Intervalo: {intervalo:2d}s | [+] [-] [p] [q] ")
            sys.stdout.flush()
            time.sleep(1)
            cuenta -= 1

            if cuenta <= 0:
                picotear(palabra)
                sys.stdout.write(f"\r>> PICOTAZO! '{palabra}' enviado.                     \n")
                sys.stdout.flush()
                cuenta = intervalo
        else:
            sys.stdout.write(f"\r[Pajaro PAUSADO] Presiona [p] para reanudar...            ")
            sys.stdout.flush()
            time.sleep(0.5)

if __name__ == "__main__":
    main()
