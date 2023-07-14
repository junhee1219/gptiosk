import time



def progress_bar(current, total, title = "Download", bar_length=40):
    progress = current / total
    completed_length = int(bar_length * progress)
    bar = '|'+'▮' * completed_length + ' ' * (bar_length - completed_length) + '| '
    percentage = str("%3d" % int(progress * 100)) + "%"
    if progress == 1:
        bar = bar + 'Done'
    print("\r",end = '')
    print("", title,":", percentage,bar,  end='')

for i in range(0,51):
    time.sleep(0.1)
    progress_bar(i,50)
