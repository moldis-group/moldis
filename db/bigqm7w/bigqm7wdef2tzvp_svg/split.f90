program main
  implicit none
  integer, parameter       :: Nmol = 12880
  integer                  :: imol, iat, nat, nco
  character(len=200)       :: line, dir, cmd, inpfile


  open(unit=100, file='bigQM7w_wB97XD_def2TZVP.xyz')
  do imol = 1, Nmol

    write(inpfile,'(a,i6.6,a)')'bigqm7wdef2tzvp_',imol,'.xyz'
    open(unit=200, file=trim(inpfile))

    read(100,*) Nat
    write(200,'(i5)') Nat
    read(100,*)
    write(200,'(a)') trim(inpfile)

    do iat = 1, nat
      read(100,'(a)') line
      write(200,'(a)') trim(line)
    enddo

    close(200)

!   write(cmd,'(3a)')'mv ', trim(inpfile), ' sep_files/'
!   call system(trim(cmd))

  enddo
  close(100)
end program main

