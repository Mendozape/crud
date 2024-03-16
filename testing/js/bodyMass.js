
     const MarkMass=78;
     const MarkHeight=1.69;
     const JohnMass=92;
     const JohnHeight=1.95;
     function CalculateBMI(Mass,Height){
          const BMI=Mass/(Height**2);
          return  BMI;
     }
     console.log(CalculateBMI(MarkMass,MarkHeight) > CalculateBMI(JohnMass,JohnHeight), CalculateBMI(MarkMass,MarkHeight),CalculateBMI(JohnMass,JohnHeight));
     console.log();
