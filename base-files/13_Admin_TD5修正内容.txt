#! /bin/bash
usage () {
	echo "Usage : admin [-del] file"
	exit
}
uid=2001
if [ $# -ne 1 -a $# -ne 2 ]; then
	usage
fi
if [ $# -eq 1 ]; then
	fic=$1
	DEL=0
else
	fic=$2
	if [ $1 != "-del" ]; then
		usage
	fi
	DEL=1
fi
if [ -r $fic ]; then
	mdp=$(grep guest /etc/shadow | cut -d':' -f2)
	while read nom prenom
	do
		if [[ ! $nom =~ ^# ]] ; then
			ini1=$(echo ${nom:0:2} | tr [A-Z] [a-z])
			ini2=$(echo ${prenom:0:2} | tr [A-Z] [a-z])
			ini=$ini1$ini2
			if [ $DEL -eq 0 ]; then
				echo "Création du compte de $prenom $nom"
				useradd -m -d /home/${nom}_${ini2} -s /bin/bash -u $uid -c "$prenom $nom - ADMIN TP LINUX" -p "$mdp" $ini
				((uid++))
			else
				message=$(userdel -r $ini 2>&1)
				if [ $? -eq 0 ]; then
					echo "Supression du compte <$ini> [OK]"
				else
					echo "[ERROR] : $message"
				fi
			fi
		fi
	done < $fic
else
	echo "Fichier $fic inaccesible"
fi
