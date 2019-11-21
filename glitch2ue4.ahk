#Persistent
SetTitleMatchMode 2
SetTimer, Browser2UE4, 1000
return

Browser2UE4:
if WinExist("GXU")
{
WinGetTitle, Title
sss := RegExMatch(Title, "GXU") - 1
MyVar := SubStr(Title,1,sss)
ToolTip, %MyVar%
}else{
ToolTip, "butts"
}
return