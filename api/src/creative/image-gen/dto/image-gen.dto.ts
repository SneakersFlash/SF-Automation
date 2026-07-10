import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const IMAGE_SIZES = ['1:1', '3:2', '2:3'] as const;

@ValidatorConstraint({ name: 'PromptOrReference', async: false })
class PromptOrReferenceConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as GenerateImageDto;
    return Boolean(dto.prompt?.trim()) || Boolean(dto.referenceImageUrls?.length);
  }
  defaultMessage(): string {
    return 'Isi prompt atau lampirkan minimal satu foto referensi.';
  }
}

// CRE-06: generate gambar via kie.ai. Mode dideteksi dari payload:
// referenceImageUrls ada -> image_edit, kosong -> text_to_image.
export class GenerateImageDto {
  // size wajib (tak pernah @IsOptional) -> tempat aman menempel validator
  // cross-field PromptOrReference (validator di properti @IsOptional lain
  // akan di-skip kalau nilainya kosong, jadi tak bisa dipakai di sini).
  @IsIn(IMAGE_SIZES, { message: 'size harus 1:1, 3:2, atau 2:3.' })
  @Validate(PromptOrReferenceConstraint)
  size!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  prompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  negativePrompt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maksimal 5 foto referensi.' })
  @IsUrl({}, { each: true, message: 'referenceImageUrls harus berupa URL valid.' })
  referenceImageUrls?: string[];

  @IsOptional() @IsString() brandProfileId?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsOptional() @IsString() generationId?: string;
}
