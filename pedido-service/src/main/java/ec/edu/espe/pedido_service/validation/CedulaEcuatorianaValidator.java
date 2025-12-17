package ec.edu.espe.pedido_service.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CedulaEcuatorianaValidator implements ConstraintValidator<CedulaEcuatoriana, Long> {

    @Override
    public boolean isValid(Long cedula, ConstraintValidatorContext context) {
        if (cedula == null) {
            return false;
        }
        
        String cedulaStr = String.valueOf(cedula);
        
        // La cédula debe tener 10 dígitos
        if (cedulaStr.length() != 10) {
            return false;
        }
        
        try {
            // Los dos primeros dígitos deben corresponder a una provincia válida (01-24)
            int provincia = Integer.parseInt(cedulaStr.substring(0, 2));
            if (provincia < 1 || provincia > 24) {
                return false;
            }
            
            // El tercer dígito debe ser menor a 6 (0-5)
            int tercerDigito = Integer.parseInt(cedulaStr.substring(2, 3));
            if (tercerDigito > 5) {
                return false;
            }
            
            // Algoritmo de validación de cédula ecuatoriana (módulo 10)
            int[] coeficientes = {2, 1, 2, 1, 2, 1, 2, 1, 2};
            int suma = 0;
            int digitoVerificador = Integer.parseInt(cedulaStr.substring(9, 10));
            
            for (int i = 0; i < 9; i++) {
                int digito = Integer.parseInt(cedulaStr.substring(i, i + 1));
                int producto = digito * coeficientes[i];
                
                // Si el producto es mayor a 9, se suma sus dígitos
                if (producto >= 10) {
                    producto = producto - 9;
                }
                
                suma += producto;
            }
            
            // Calcular el dígito verificador esperado
            int residuo = suma % 10;
            int verificadorCalculado = (residuo == 0) ? 0 : 10 - residuo;
            
            return verificadorCalculado == digitoVerificador;
            
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
