package TP.SpringBootGrupal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;


@SpringBootApplication
public class SpringBootGrupalApplication {

	public static void main(String[] args) {
		ApplicationContext context =
				SpringApplication.run(
						SpringBootGrupalApplication.class,
						args
				);
	}
}