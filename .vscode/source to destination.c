#include<stdio.h>
#include<conio.h>
int main (){
  FILE *fs, *fd;
  char source_file[30], dest_file[30];
  char ch;
  printf("Enter source file name:");
  scanf("%s", source_file);
  printf("Enter destination file name:");
  scanf("%s", dest_file);

  fs = fopen(source_file, "r");
  if (fs == NULL)
  {
    printf("Error, can not open source file.");
    exit(1);
  }
  fd = fopen(dest_file, "w");
  if (fd == NULL)
  {
    printf("Error, can not open destination file.");
    fclose(fs);
    exit(2);
  }
  while ((ch = fgetc(fs))!= EOF){
    fputc(ch,fd);

  }
  fclose(fs);
  fclose(fd);
  return 0; 
}