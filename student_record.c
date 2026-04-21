#include<stdio.h>
#include<conio.h>
struct student {
  charname[50];
  int roll;
  float marks;
};
int main () 
{
  struct student s[5];
  FILE *fp;
  int i;
  fp = fopen("student.txt","w");
  if (fp == NULL) {
    printf("File not opened");
    exit(1);
  }
  printf("Emter name, roll number and marks of 5 students:\n");
  for (i = 0; i < 5; i++) {
  printf("\n For student %d:",i+1);
  printf("\n Name\t Roll Number\t Marks\n");
    scanf("%s %d %f", s[i].name, &s[i].roll, &s[i].marks);
    fprintf(fp, "%s %d %.2f\n", s[i].name, s[i].roll, s[i].marks);
  }
  fclose(fp);
  printf("\nData written to file successfully.");
  return 0; 
}