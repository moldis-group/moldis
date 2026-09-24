import os 

for i in range(1,1200):
    os.system('rm rmq1d_%s.svg'%i)
    #os.system('inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileQuit rmq1d_%s.svg'%i)
    #os.system('inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileQuit rmq1d_%s_BS.svg'%i)
    #os.system('inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileQuit rmq1d_%s_phonon_BS.svg'%i)
