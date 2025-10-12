export default function(image) {
  const query = [
    `filename=${encodeURIComponent(image.filename)}`,
    `subfolder=${encodeURIComponent(image.subfolder || '')}`,
    `type=${encodeURIComponent(image.type)}`,
  ];

  if(image.prompt_id)
    query.push(`prompt_id=${image.prompt_id}`);

  return `/api/view?${query.join('&')}`;
}
