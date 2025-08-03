import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export async function parseCLIArgs() {
  return yargs(hideBin(process.argv))
    .option('project', {
      alias: 'p',
      type: 'string',
      default: './tests/example-react-app',
      describe: 'Ruta al proyecto a analizar o generar tests'
    })
    .option('include', {
      alias: 'i',
      type: 'string',
      describe: 'Subcarpeta a incluir (ej: src/)'
    })
    .option('limit', {
      alias: 'l',
      type: 'number',
      describe: 'Límite de archivos a procesar'
    })
    .option('overwrite', {
      alias: 'o',
      type: 'boolean',
      default: false,
      describe: 'Sobrescribir archivos existentes'
    })
    .option('serve', {
      alias: 's',
      type: 'boolean',
      default: false,
      describe: 'Whether to launch the project web server automatically',
    })
    .help()
    .argv
}
