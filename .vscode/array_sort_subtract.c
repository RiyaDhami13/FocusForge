/*1-D Array Manipulation (Subtract 7 & Sort Descending)*/

#include<stdio.h>
int main()
{
  int arr[7],i,j,temp;
  for(i=0;i<7;i++)
  {
    scanf("%d",&arr[i]);
    arr[i]-=7;
  }
  for(i=0;i<6;i++){
    for(j=i+1;j<7;j++){
      if(arr[i]<arr[j]){
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

      }
    }
  }
  for(i=0;i<7;i++)
  {
    printf("%d ",arr[i]);
  }
  return 0;
}